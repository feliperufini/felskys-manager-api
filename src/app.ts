import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { organizationsRoutes } from './routes/organizations'

export const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(organizationsRoutes, {
  prefix: 'organizations',
})
