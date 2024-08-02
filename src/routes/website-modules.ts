import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { generateSlug } from '../utils/general-helper'

export async function websiteModuleRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const websiteModules = await prisma.websiteModule.findMany()

    return { websites_modules: websiteModules }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
    const getWebsiteModulesParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getWebsiteModulesParamsSchema.parse(request.params)

    const websiteModule = await prisma.websiteModule.findUniqueOrThrow({
      where: { id },
    })

    return { websites_module: websiteModule }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', async (request, response) => {
      const createWebsiteModuleBodySchema = z.object({
        title: z.string(),
      })

      const { title } = createWebsiteModuleBodySchema.parse(request.body)

      try {
        await prisma.websiteModule.create({
          data: {
            id: randomUUID(),
            title,
            slug: generateSlug(title),
          },
        })

        return response
          .status(201)
          .send({ message: 'Módulo cadastrado com sucesso!' })
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

  // app
  //   .withTypeProvider<ZodTypeProvider>()
  //   .put('/:id', async (request, response) => {
  //     const getWebsiteModulesParamsSchema = z.object({
  //       id: z.string().uuid(),
  //     })
  //     const { id } = getWebsiteModulesParamsSchema.parse(request.params)

  //     const updateWebsiteModuleBodySchema = z.object({
  //       title: z.string(),
  //       domain: z.string().url(),
  //       organization_id: z.string().uuid(),
  //     })
  //     const { title, domain, organization_id } =
  //       updateWebsiteModuleBodySchema.parse(request.body)

  //     try {
  //       await prisma.websiteModule.update({
  //         where: {
  //           id,
  //         },
  //         data: {
  //           title,
  //           domain,
  //           organization_id,
  //           updated_at: new Date(),
  //         },
  //       })

  //       return response
  //         .status(201)
  //         .send({ message: 'Website atualizado com sucesso!' })
  //     } catch (error: unknown) {
  //       if (error instanceof Error) {
  //         return response.status(400).send({
  //           message: 'Erro ao atualizar o website.',
  //           error: error?.message,
  //         })
  //       } else {
  //         return response.status(400).send({
  //           message: 'Erro ao atualizar o website.',
  //           error,
  //         })
  //       }
  //     }
  //   })

  // app
  //   .withTypeProvider<ZodTypeProvider>()
  //   .delete('/:id', async (request, response) => {
  //     const getWebsiteModulesParamsSchema = z.object({
  //       id: z.string().uuid(),
  //     })
  //     const { id } = getWebsiteModulesParamsSchema.parse(request.params)

  //     try {
  //       await prisma.websiteModule.delete({ where: { id } })

  //       return response
  //         .status(200)
  //         .send({ message: 'Website deletado com sucesso!' })
  //     } catch (error: unknown) {
  //       if (error instanceof Error) {
  //         return response.status(400).send({
  //           message: 'Erro ao deletar o website.',
  //           error: error?.message,
  //         })
  //       } else {
  //         return response.status(400).send({
  //           message: 'Erro ao deletar o website.',
  //           error,
  //         })
  //       }
  //     }
  //   })
}
