import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../libs/prisma'
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
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/default-permissions', async (request, response) => {
      const createPermissionsBodySchema = z.object({
        website_module_id: z.string().uuid(),
      })

      const { website_module_id } = createPermissionsBodySchema.parse(
        request.body,
      )

      await prisma.$transaction(async (prisma) => {
        const websiteModule = await prisma.websiteModule.findUniqueOrThrow({
          where: {
            id: website_module_id,
          },
        })

        const defaultPermissions = [
          'Listar',
          'Buscar',
          'Cadastrar',
          'Editar',
          'Deletar',
        ]

        for (const defaultPermission of defaultPermissions) {
          const permissionTitle = defaultPermission + ' ' + websiteModule.title

          await prisma.permission.create({
            data: {
              id: randomUUID(),
              title: permissionTitle,
              action: generateUnderscoreSlug(permissionTitle),
              website_module_id,
            },
          })
        }
      })

      return response
        .status(201)
        .send({ message: 'Permissões cadastradas com sucesso!' })
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
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', async (request, response) => {
      const getPermissionsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getPermissionsParamsSchema.parse(request.params)

      await prisma.permission.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Permissão deletada com sucesso!' })
    })
}
