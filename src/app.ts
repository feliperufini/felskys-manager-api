import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMiddie from '@fastify/middie'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from './env'
import { errorHandler } from './error-handler'
import { logging } from './middlewares/logging'
import { authenticationRoutes } from './routes/authentications'
import { invoiceRoutes } from './routes/invoices'
import { organizationRoutes } from './routes/organizations'
import { paymentRoutes } from './routes/payments'
import { permissionRoutes } from './routes/permissions'
import { roleRoutes } from './routes/roles'
import { userRoutes } from './routes/users'
import { websiteModuleRoutes } from './routes/website-modules'
import { websiteRoutes } from './routes/websites'

export const app = fastify() // fastify({ logger: true })

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors, {
  origin: '*',
})

app
  .register(fastifyMiddie, {
    hook: 'onResponse',
  })
  .register(logging)

app.register(authenticationRoutes)

app.register(invoiceRoutes, {
  prefix: 'invoices',
})

app.register(organizationRoutes, {
  prefix: 'organizations',
})

app.register(paymentRoutes, {
  prefix: 'payments',
})

app.register(permissionRoutes, {
  prefix: 'permissions',
})

app.register(roleRoutes, {
  prefix: 'roles',
})

app.register(userRoutes, {
  prefix: 'users',
})

app.register(websiteRoutes, {
  prefix: 'websites',
})

app.register(websiteModuleRoutes, {
  prefix: 'website-modules',
})
