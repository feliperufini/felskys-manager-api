import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { generateUnderscoreSlug } from '../utils/general-helper'

export async function permissionRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const permissions = await prisma.permission.findMany()

    return { permissions }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
    const getPermissionsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getPermissionsParamsSchema.parse(request.params)

    const permission = await prisma.permission.findUniqueOrThrow({
      where: { id },
    })

    return { permission }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', async (request, response) => {
      const createPermissionsBodySchema = z.object({
        title: z.string().max(45),
        website_module_id: z.string().uuid(),
      })

      const { title, website_module_id } = createPermissionsBodySchema.parse(
        request.body,
      )

      try {
        await prisma.permission.create({
          data: {
            id: randomUUID(),
            title,
            action: generateUnderscoreSlug(title),
            website_module_id,
          },
        })

        return response
          .status(201)
          .send({ message: 'Permissão cadastrada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao cadastrar a permissão.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao cadastrar a permissão.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getPermissionsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPermissionsParamsSchema.parse(request.params)

      const updatePermissionsBodySchema = z.object({
        title: z.string(),
        website_module_id: z.string().uuid(),
        action: z.string().nullish(),
      })
      const { title, website_module_id, action } =
        updatePermissionsBodySchema.parse(request.body)

      try {
        await prisma.permission.update({
          where: {
            id,
          },
          data: {
            title,
            website_module_id,
            action: generateUnderscoreSlug(
              action && action !== '' ? action : title,
            ),
          },
        })

        return response
          .status(201)
          .send({ message: 'Permissão atualizada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao atualizar a permissão.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao atualizar a permissão.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getPermissionsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPermissionsParamsSchema.parse(request.params)

      try {
        await prisma.permission.delete({ where: { id } })

        return response
          .status(200)
          .send({ message: 'Permissão deletada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao deletar a permissão.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao deletar a permissão.',
            error,
          })
        }
      }
    })
}
