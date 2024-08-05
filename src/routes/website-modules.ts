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

      try {
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
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao cadastrar o módulo.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao cadastrar o módulo.',
            error,
          })
        }
      }
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

      try {
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
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao atualizar o módulo.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao atualizar o módulo.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getWebsiteModulesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getWebsiteModulesParamsSchema.parse(request.params)

      try {
        await prisma.websiteModule.delete({ where: { id } })

        return response
          .status(200)
          .send({ message: 'Módulo deletado com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao deletar o módulo.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao deletar o módulo.',
            error,
          })
        }
      }
    })
}
