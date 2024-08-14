import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../libs/prisma'
import { checkPasswordIsValid } from '../utils/general-helper'
import { userEmailTokenRequest, verifyJwt } from '../middlewares/jwt-auth'

export async function userRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/', { onRequest: [verifyJwt] }, async () => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          nickname: true,
          email: true,
          is_active: true,
          role_id: true,
          created_at: true,
          updated_at: true,
          updated_by: true,
        },
      })

      return { users }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/:id', { onRequest: [verifyJwt] }, async (request) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUsersParamsSchema.parse(request.params)

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          nickname: true,
          email: true,
          is_active: true,
          role_id: true,
          created_at: true,
          updated_at: true,
          updated_by: true,
        },
      })

      return { user }
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/', { onRequest: [verifyJwt] }, async (request, response) => {
      const createUsersBodySchema = z.object({
        nickname: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8),
        role_id: z.string().uuid(),
      })

      const { nickname, email, password, role_id } =
        createUsersBodySchema.parse(request.body)

      const isPasswordInvalid = !checkPasswordIsValid(password)
      if (isPasswordInvalid) {
        return response.status(422).send({
          message:
            'Sua senha precisa ter ao menos 8 caracteres, 1 letra e 1 número.',
        })
      }

      const passwordHash = await hash(password, 8)

      await prisma.user.create({
        data: {
          id: randomUUID(),
          nickname,
          email,
          password_hash: passwordHash,
          role_id,
          updated_by: userEmailTokenRequest(request),
        },
      })

      return response
        .status(201)
        .send({ message: 'Usuário cadastrado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUsersParamsSchema.parse(request.params)

      const updateUsersBodySchema = z.object({
        nickname: z.string().min(3),
        email: z.string().email(),
        password: z.string().nullish(),
        is_active: z.boolean(),
        role_id: z.string().uuid(),
      })

      const { nickname, email, password, is_active, role_id } =
        updateUsersBodySchema.parse(request.body)

      type UpdateRequestType = {
        nickname: string
        email: string
        password_hash?: string
        is_active: boolean
        role_id: string
        updated_by: string
      }

      const requestUserData: UpdateRequestType = {
        nickname,
        email,
        is_active,
        role_id,
        updated_by: userEmailTokenRequest(request),
      }

      if (password && password !== '') {
        const isPasswordInvalid = !checkPasswordIsValid(password)
        if (isPasswordInvalid) {
          return response.status(422).send({
            message:
              'Sua senha precisa ter ao menos 8 caracteres, 1 letra e 1 número.',
          })
        }

        requestUserData.password_hash = await hash(password, 8)
      }

      await prisma.user.update({
        where: { id },
        data: requestUserData,
      })

      return response
        .status(201)
        .send({ message: 'Usuário atualizado com sucesso!' })
    })

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:id', { onRequest: [verifyJwt] }, async (request, response) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getUsersParamsSchema.parse(request.params)

      await prisma.user.delete({ where: { id } })

      return response
        .status(200)
        .send({ message: 'Usuário deletado com sucesso!' })
    })
}
