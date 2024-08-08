import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../libs/prisma'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function roleRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', async () => {
    const roles = await prisma.role.findMany()

    return { roles }
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', async (request) => {
    const getRolesParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getRolesParamsSchema.parse(request.params)

    const role = await prisma.role.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return { role }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', async (request, response) => {
      const createRolesBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        organization_id: z.string().uuid(),
      })

      const { name, description, organization_id } =
        createRolesBodySchema.parse(request.body)

      await prisma.role.create({
        data: {
          id: randomUUID(),
          name,
          description,
          organization_id,
        },
      })

      return response
        .status(201)
        .send({ message: 'Função cadastrada com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', async (request, response) => {
      const getRolesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getRolesParamsSchema.parse(request.params)

      const updateRolesBodySchema = z.object({
        name: z.string(),
        description: z.string(),
      })
      const { name, description } = updateRolesBodySchema.parse(request.body)

      await prisma.role.update({
        where: {
          id,
        },
        data: {
          name,
          description,
        },
      })

      return response
        .status(201)
        .send({ message: 'Função atualizada com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getRolesParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getRolesParamsSchema.parse(request.params)

      await prisma.role.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Função deletada com sucesso!' })
    })
}
