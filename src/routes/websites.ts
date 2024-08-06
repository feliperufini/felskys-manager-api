import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
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
      })

      const { title, domain, organization_id } = createWebsitesBodySchema.parse(
        request.body,
      )

      await prisma.website.create({
        data: {
          id: randomUUID(),
          title,
          domain,
          organization_id,
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
      })
      const { title, domain, organization_id } = updateWebsitesBodySchema.parse(
        request.body,
      )

      await prisma.website.update({
        where: {
          id,
        },
        data: {
          title,
          domain,
          organization_id,
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
