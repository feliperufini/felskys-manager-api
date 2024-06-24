import fastify from 'fastify'
import { organizationsRoutes } from './routes/organizations'

export const app = fastify()

app.register(organizationsRoutes, {
  prefix: 'organizations',
})
