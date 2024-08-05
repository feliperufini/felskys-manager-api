import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { removeSpecialCharacters } from '../utils/general-helper'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../error-handler'

export async function organizationRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const organizations = await prisma.organization.findMany()

    return { organizations }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
    const getOrganizationsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getOrganizationsParamsSchema.parse(request.params)

    const organization = await prisma.organization.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!organization) {
      throw new ClientError('Viagem não encontrada.')
    }

    return { organization }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', async (request, response) => {
      const createOrganizationsBodySchema = z.object({
        legal_name: z.string(),
        business_name: z.string(),
        document: z.string(),
      })

      const { legal_name, business_name, document } =
        createOrganizationsBodySchema.parse(request.body)

      try {
        await prisma.organization.create({
          data: {
            id: randomUUID(),
            legal_name,
            business_name,
            document: removeSpecialCharacters(document),
          },
        })

        return response
          .status(201)
          .send({ message: 'Organização cadastrada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao cadastrar a organização.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao cadastrar a organização.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getOrganizationsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getOrganizationsParamsSchema.parse(request.params)

      const updateOrganizationsBodySchema = z.object({
        legal_name: z.string(),
        business_name: z.string(),
        document: z.string(),
        is_active: z.boolean(),
      })
      const { legal_name, business_name, document, is_active } =
        updateOrganizationsBodySchema.parse(request.body)

      try {
        await prisma.organization.update({
          where: {
            id,
          },
          data: {
            legal_name,
            business_name,
            document,
            is_active,
          },
        })

        return response
          .status(201)
          .send({ message: 'Organização atualizada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao atualizar a organização.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao atualizar a organização.',
            error,
          })
        }
      }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getOrganizationsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getOrganizationsParamsSchema.parse(request.params)

      try {
        await prisma.organization.delete({ where: { id } })

        return response
          .status(200)
          .send({ message: 'Organização deletada com sucesso!' })
      } catch (error: unknown) {
        if (error instanceof Error) {
          return response.status(400).send({
            message: 'Erro ao deletar a organização.',
            error: error?.message,
          })
        } else {
          return response.status(400).send({
            message: 'Erro ao deletar a organização.',
            error,
          })
        }
      }
    })
}
