import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { generateSlug } from '../utils/general-helper'

export async function websiteModuleRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const websiteModules = await prisma.websiteModule.findMany()

    return { website_modules: websiteModules }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
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
    .post('/', async (request, response) => {
      const createWebsiteModulesBodySchema = z.object({
        title: z.string(),
      })

      const { title } = createWebsiteModulesBodySchema.parse(request.body)

      const websiteModule = await prisma.websiteModule.create({
        data: {
          id: randomUUID(),
          title,
          slug: generateSlug(title),
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
    .put('/:id', async (request, response) => {
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
        },
      })

      return response
        .status(201)
        .send({ message: 'Módulo atualizado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
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
