import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../libs/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function websiteRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const websites = await prisma.website.findMany()

    return { websites }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
    const getWebsitesParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getWebsitesParamsSchema.parse(request.params)

    const website = await prisma.website.findUniqueOrThrow({
      where: { id },
      include: {
        website_modules: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return { website }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', async (request, response) => {
      const createWebsitesBodySchema = z.object({
        title: z.string(),
        domain: z.string().url(),
        organization_id: z.string().uuid(),
        website_modules: z.string().uuid().array(),
      })

      const { title, domain, organization_id, website_modules } =
        createWebsitesBodySchema.parse(request.body)

      const websiteModulesIds = website_modules.map((moduleId) => ({
        id: moduleId,
      }))

      await prisma.website.create({
        data: {
          id: randomUUID(),
          title,
          domain,
          organization_id,
          website_modules: {
            connect: websiteModulesIds,
          },
        },
      })

      return response
        .status(201)
        .send({ message: 'Website cadastrado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getWebsitesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getWebsitesParamsSchema.parse(request.params)

      const updateWebsitesBodySchema = z.object({
        title: z.string(),
        domain: z.string().url(),
        organization_id: z.string().uuid(),
        website_modules: z.string().uuid().array(),
      })
      const { title, domain, organization_id, website_modules } =
        updateWebsitesBodySchema.parse(request.body)

      const websiteModulesIds = website_modules.map((moduleId) => ({
        id: moduleId,
      }))

      const existingWebsite = await prisma.website.findUniqueOrThrow({
        where: { id },
        select: { website_modules: { select: { id: true } } },
      })

      const existingModuleIds = existingWebsite.website_modules.map(
        (module) => module.id,
      )

      const modulesToDisconnect = existingModuleIds
        .filter((moduleId) => !website_modules.includes(moduleId))
        .map((moduleId) => ({ id: moduleId }))

      const modulesToConnect = websiteModulesIds

      await prisma.website.update({
        where: { id },
        data: {
          title,
          domain,
          organization_id,
          website_modules: {
            disconnect: modulesToDisconnect,
            connect: modulesToConnect,
          },
        },
      })

      return response
        .status(201)
        .send({ message: 'Website atualizado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getWebsitesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getWebsitesParamsSchema.parse(request.params)

      await prisma.website.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Website deletado com sucesso!' })
    })
}
