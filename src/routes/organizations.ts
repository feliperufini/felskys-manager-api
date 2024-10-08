import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../libs/prisma'
import { removeSpecialCharacters } from '../utils/general-helper'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { userEmailTokenRequest, verifyJwt } from '../middlewares/jwt-auth'

export async function organizationRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/', { onRequest: [verifyJwt] }, async () => {
      const organizations = await prisma.organization.findMany()

      return { organizations }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/:id', { onRequest: [verifyJwt] }, async (request) => {
      const getOrganizationsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getOrganizationsParamsSchema.parse(request.params)

      const organization = await prisma.organization.findUniqueOrThrow({
        where: {
          id,
        },
      })

      return { organization }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/:id/roles', { onRequest: [verifyJwt] }, async (request) => {
      const getOrganizationsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getOrganizationsParamsSchema.parse(request.params)

      const organization = await prisma.organization.findUniqueOrThrow({
        where: {
          id,
        },
      })

      const roles = await prisma.role.findMany({
        where: {
          organization_id: organization.id,
        },
      })

      return { roles }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', { onRequest: [verifyJwt] }, async (request, response) => {
      const createOrganizationsBodySchema = z.object({
        legal_name: z.string(),
        business_name: z.string(),
        document: z.string(),
      })

      const { legal_name, business_name, document } =
        createOrganizationsBodySchema.parse(request.body)

      await prisma.organization.create({
        data: {
          id: randomUUID(),
          legal_name,
          business_name,
          document: removeSpecialCharacters(document),
          updated_by: userEmailTokenRequest(request),
        },
      })

      return response
        .status(201)
        .send({ message: 'Organização cadastrada com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
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

      await prisma.organization.update({
        where: {
          id,
        },
        data: {
          legal_name,
          business_name,
          document,
          is_active,
          updated_by: userEmailTokenRequest(request),
        },
      })

      return response
        .status(201)
        .send({ message: 'Organização atualizada com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getOrganizationsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getOrganizationsParamsSchema.parse(request.params)

      await prisma.organization.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Organização deletada com sucesso!' })
    })
}
