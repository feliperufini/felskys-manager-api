import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { removeSpecialCharacters } from '../utils/generalHelper'
import { prisma } from '../lib/prisma'

export async function organizationsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const organizations = await prisma.organizations.findMany()

    return { organizations }
  })

  app.get('/:id', async (request) => {
    const getOrganizationsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getOrganizationsParamsSchema.parse(request.params)

    const organization = await prisma.organizations.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return { organization }
  })

  app.post('/', async (request, response) => {
    const createOrganizationBodySchema = z.object({
      legalName: z.string(),
      businessName: z.string(),
      document: z.string(),
    })

    const { legalName, businessName, document } =
      createOrganizationBodySchema.parse(request.body)

    try {
      await prisma.organizations.create({
        data: {
          id: randomUUID(),
          legalName,
          businessName,
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

  app.put('/:id', async (request, response) => {
    const getOrganizationsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getOrganizationsParamsSchema.parse(request.params)

    const updateOrganizationBodySchema = z.object({
      legalName: z.string(),
      businessName: z.string(),
      document: z.string(),
      status: z.boolean(),
    })
    const { legalName, businessName, document, status } =
      updateOrganizationBodySchema.parse(request.body)

    try {
      await prisma.organizations.update({
        where: {
          id,
        },
        data: {
          legalName,
          businessName,
          document,
          status,
          updatedAt: new Date(),
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

  app.delete('/:id', async (request, response) => {
    const getOrganizationsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getOrganizationsParamsSchema.parse(request.params)

    try {
      await prisma.organizations.delete({ where: { id } })

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
