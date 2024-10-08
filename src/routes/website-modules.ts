import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../libs/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { generateSlug } from '../utils/general-helper'
import { userEmailTokenRequest, verifyJwt } from '../middlewares/jwt-auth'

export async function websiteModuleRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/', { onRequest: [verifyJwt] }, async () => {
      const websiteModules = await prisma.websiteModule.findMany()

      return { website_modules: websiteModules }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/:id', { onRequest: [verifyJwt] }, async (request) => {
      const getWebsiteModulesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getWebsiteModulesParamsSchema.parse(request.params)

      const websiteModule = await prisma.websiteModule.findUniqueOrThrow({
        where: { id },
      })

      return { website_module: websiteModule }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', { onRequest: [verifyJwt] }, async (request, response) => {
      const createWebsiteModulesBodySchema = z.object({
        title: z.string(),
      })

      const { title } = createWebsiteModulesBodySchema.parse(request.body)

      const websiteModule = await prisma.websiteModule.create({
        data: {
          id: randomUUID(),
          title,
          slug: generateSlug(title),
          updated_by: userEmailTokenRequest(request),
        },
      })

      return response.status(201).send({
        message: 'Módulo cadastrado com sucesso!',
        data: {
          website_module_id: websiteModule.id,
        },
      })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getWebsiteModulesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getWebsiteModulesParamsSchema.parse(request.params)

      const updateWebsiteModulesBodySchema = z.object({
        title: z.string(),
        slug: z.string().nullish(),
      })
      const { title, slug } = updateWebsiteModulesBodySchema.parse(request.body)

      await prisma.websiteModule.update({
        where: {
          id,
        },
        data: {
          title,
          slug: generateSlug(slug && slug !== '' ? slug : title),
          updated_by: userEmailTokenRequest(request),
        },
      })

      return response
        .status(201)
        .send({ message: 'Módulo atualizado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getWebsiteModulesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getWebsiteModulesParamsSchema.parse(request.params)

      await prisma.websiteModule.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Módulo deletado com sucesso!' })
    })
}
