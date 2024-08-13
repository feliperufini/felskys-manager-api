import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../libs/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { userEmailTokenRequest, verifyJwt } from '../middlewares/jwt-auth'

export async function roleRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/', { onRequest: [verifyJwt] }, async () => {
      const roles = await prisma.role.findMany()

      return { roles }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/:id', { onRequest: [verifyJwt] }, async (request) => {
      const getRolesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getRolesParamsSchema.parse(request.params)

      const role = await prisma.role.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          permissions: {
            select: {
              id: true,
              title: true,
              action: true,
              website_module_id: true,
            },
          },
        },
      })

      return { role }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', { onRequest: [verifyJwt] }, async (request, response) => {
      const createRolesBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        organization_id: z.string().uuid(),
        permissions: z.string().uuid().array(),
      })

      const { name, description, organization_id, permissions } =
        createRolesBodySchema.parse(request.body)

      const permissionsIds = permissions.map((permissionId) => ({
        id: permissionId,
      }))

      await prisma.role.create({
        data: {
          id: randomUUID(),
          name,
          description,
          organization_id,
          permissions: {
            connect: permissionsIds,
          },
          updated_by: userEmailTokenRequest(request),
        },
      })

      return response
        .status(201)
        .send({ message: 'Função cadastrada com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getRolesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getRolesParamsSchema.parse(request.params)

      const updateRolesBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        permissions: z.string().uuid().array(),
      })
      const { name, description, permissions } = updateRolesBodySchema.parse(
        request.body,
      )

      const permissionsIds = permissions.map((permissionId) => ({
        id: permissionId,
      }))

      const existingRole = await prisma.role.findUniqueOrThrow({
        where: { id },
        select: { permissions: { select: { id: true } } },
      })

      const existingRoleIds = existingRole.permissions.map(
        (module) => module.id,
      )

      const permissionsToDisconnect = existingRoleIds
        .filter((moduleId) => !permissions.includes(moduleId))
        .map((moduleId) => ({ id: moduleId }))

      const permissionsToConnect = permissionsIds

      await prisma.role.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          permissions: {
            disconnect: permissionsToDisconnect,
            connect: permissionsToConnect,
          },
          updated_by: userEmailTokenRequest(request),
        },
      })

      return response
        .status(201)
        .send({ message: 'Função atualizada com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getRolesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getRolesParamsSchema.parse(request.params)

      await prisma.$transaction(async (prisma) => {
        await prisma.user.updateMany({
          where: { role_id: id },
          data: {
            is_active: false,
            role_id: null,
          },
        })

        await prisma.role.delete({ where: { id } })
      })

      return response
        .status(200)
        .send({ message: 'Função deletada com sucesso!' })
    })
}
