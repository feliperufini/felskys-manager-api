import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { getModuleNameTranslationFromUrl } from './utils/translate-helper'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export class ClientError extends Error {}

export const errorHandler: FastifyErrorHandler = (error, request, response) => {
  if (error instanceof ZodError) {
    // ERROS DE VALIDACAO DO ZOD
    return response.status(422).send({
      message: 'Erro na validação dos inputs.',
      error: error.flatten().fieldErrors,
    })
  } else if (error instanceof PrismaClientKnownRequestError) {
    // ERROS DE VALIDACAO DO PRISMA
    return translatePrismaError(error, request, response)
  } else if (error instanceof ClientError) {
    // ERROS DE VALIDACAO GERAL
    return response.status(400).send({
      message: error.message,
      error: {
        content: 'Erro na validação da operação.',
      },
    })
  }

  return response.status(500).send({
    message: 'Internal server error.',
    error,
  })
}

const translatePrismaError: FastifyErrorHandler = (error, _, response) => {
  console.log(response.request.url)

  if (error instanceof PrismaClientKnownRequestError) {
    const translatedModuleName = getModuleNameTranslationFromUrl(
      response.request.url,
    )

    if (error.code === 'P2002') {
      // "Unique constraint failed on the {constraint}"
      const fields = (error.meta?.target as string[]) || []

      return response.status(409).send({
        message: `O valor informado no campo '${fields.join(`', '`)}' já está cadastrado.`,
        error,
      })
    } else if (error.code === 'P2003') {
      // "Foreign key constraint failed on the field: {field_name}"
      return response.status(409).send({
        message: `ID de referência à outra tabela não encontrado.`,
        error,
      })
    } else if (error.code === 'P2025') {
      // "An operation failed because it depends on one or more records that were required but not found. {cause}"
      return response.status(404).send({
        message: `${translatedModuleName} não encontrado(a).`,
        error,
      })
    }
  }

  return response.status(444).send({
    message: error,
    error,
  })
}
