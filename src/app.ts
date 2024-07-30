import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { invoiceRoutes } from './routes/invoices'
import { organizationRoutes } from './routes/organizations'
import { roleRoutes } from './routes/roles'
import { userRoutes } from './routes/users'

export const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyCors, {
  origin: '*',
})

app.register(invoiceRoutes, {
  prefix: 'invoices',
})

app.register(organizationRoutes, {
  prefix: 'organizations',
})

app.register(roleRoutes, {
  prefix: 'roles',
})

app.register(userRoutes, {
  prefix: 'users',
})
