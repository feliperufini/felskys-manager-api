import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { organizationsRoutes } from './routes/organizations'
import { rolesRoutes } from './routes/roles'

export const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(organizationsRoutes, {
  prefix: 'organizations',
})

app.register(rolesRoutes, {
  prefix: 'roles',
})
