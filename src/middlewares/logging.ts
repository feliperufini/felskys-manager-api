import { randomUUID } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import { JwtPayload } from 'jsonwebtoken'
import { app } from '../app'
import prisma from '../libs/prisma'
import { getModuleNameTranslationFromUrl } from '../utils/translate-helper'

export async function logging() {
  app.addHook(
    'onResponse',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      response: FastifyReply,
    ) => {
      const tokenUser = request.user as JwtPayload
      const userId = tokenUser?.id || 'UNKNOWN_USER'

      const translatedModuleName = getModuleNameTranslationFromUrl(request.url)

      const textForMethod = (method: string): string => {
        switch (method) {
          case 'POST':
            return 'cadastrar'
          case 'PUT':
            return 'editar'
          case 'PATCH':
            return 'editar'
          case 'DELETE':
            return 'deletar'
          default:
            return 'iterar'
        }
      }

      const convertStatusCode = () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          return {
            message: `Sucesso ao ${textForMethod(request.method)} ${translatedModuleName}`,
            level: 'INFO',
          }
        } else if (response.statusCode >= 400 && response.statusCode < 500) {
          return {
            message: `Falha ao ${textForMethod(request.method)} ${translatedModuleName}`,
            level: 'WARNING',
          }
        } else if (response.statusCode === 500) {
          return {
            message: `Erro ao ${textForMethod(request.method)} ${translatedModuleName}`,
            level: 'ERROR',
          }
        } else {
          return {
            message: `Informação ao ${textForMethod(request.method)} ${translatedModuleName}`,
            level: 'INFO',
          }
        }
      }

      await prisma.log.create({
        data: {
          id: randomUUID(),
          method: request.method,
          model: translatedModuleName,
          register_id: request.params.id ?? 'NEW',
          api_route: request.url,
          message: convertStatusCode().message,
          context: request.body ? JSON.stringify(request.body) : null,
          level: convertStatusCode().level,
          status_code: response.statusCode,
          created_by: userId,
        },
      })
    },
  )
}
