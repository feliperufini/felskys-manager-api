import fastify from 'fastify'
import { env } from './env'
import { organizationsRoutes } from './routes/organizations'

const app = fastify()

app.register(organizationsRoutes, {
  prefix: 'organizations',
})

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
