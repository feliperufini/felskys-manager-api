import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { organizationsRoutes } from './routes/organizations'
import { rolesRoutes } from './routes/roles'
import { usersRoutes } from './routes/users'

export const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyCors, {
  origin: '*',
})

app.register(organizationsRoutes, {
  prefix: 'organizations',
})

app.register(rolesRoutes, {
  prefix: 'roles',
})

app.register(usersRoutes, {
  prefix: 'users',
})
