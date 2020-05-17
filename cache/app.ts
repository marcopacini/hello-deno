import { Application, Context, Router, RouterContext } from 'https://deno.land/x/oak/mod.ts'

const env = Deno.env.toObject()

const PORT = env.PORT || 8080
const HOST = env.HOST || 'localhost'

const cache = new Map<string, string>()

const router = new Router()

router
    .get('/:key', (context: RouterContext) => {
        const { params, response } = context
        
        if (params && params.key && cache.has(params.key)) {
            response.status = 200
            response.body = cache.get(params.key)
            return
        }

        response.status = 404
    })
    .post('/:key', async (context: RouterContext) => {
        const { params, request, response } = context
        const body = await request.body()

        if (params && params.key) {
            cache.set(params.key, body.value)
            response.status = 200
            return
        }

        response.status = 400
    })
    
const app = new Application()

// Logger
app.use(async (ctx, next) => {
    await next()
    const ms = ctx.response.headers.get("X-Response-Time")
    const status = ctx.response.status
    console.log(`${ctx.request.method} ${ctx.request.url} - ${status} - ${ms}`)
})

// Timing
app.use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    ctx.response.headers.set("X-Response-Time", `${ms} ms`)
})

app.use(router.routes())
app.use(router.allowedMethods())

console.log(`Listening on ${HOST}:${PORT}`)
await app.listen(`${HOST}:${PORT}`)
