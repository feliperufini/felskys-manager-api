import { randomUUID } from 'node:crypto'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { JwtPayload } from 'jsonwebtoken'
import { app } from '../app'
import prisma from '../libs/prisma'
import {
	getModelNameDatabase,
	getModelNameTranslatedFromUrl,
} from '../utils/translate-helper'

export async function logging() {
	app.addHook(
		'onResponse',
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			response: FastifyReply,
		) => {
			console.log('request.method', request.method)
			console.log('request.url', request.url)

			if (request.method === 'GET') {
				return
			}

			if (request.url === '/login') {
				return
			}

			const translatedModelName = getModelNameTranslatedFromUrl(request.url)
			const model = getModelNameDatabase(request.url.split('/')[1])

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
						return 'efetuar'
				}
			}

			const convertStatusCode = () => {
				if (response.statusCode >= 200 && response.statusCode < 300) {
					return {
						message: `Sucesso ao ${textForMethod(request.method)} ${translatedModelName}`,
						level: 'SUCCESS',
					}
				} else if (response.statusCode >= 400 && response.statusCode < 500) {
					return {
						message: `Falha ao ${textForMethod(request.method)} ${translatedModelName}`,
						level: 'WARNING',
					}
				} else if (response.statusCode === 500) {
					return {
						message: `Erro ao ${textForMethod(request.method)} ${translatedModelName}`,
						level: 'ERROR',
					}
				} else {
					return {
						message: `Informação ao ${textForMethod(request.method)} ${translatedModelName}`,
						level: 'INFO',
					}
				}
			}

			const tokenUser = request.user as JwtPayload

			// const modelDatabaseName = getModelNameDatabase(model)
			// const meuItem = await (prisma as any)[modelDatabaseName].findFirst({
			// 	orderBy: {
			// 		created_at: 'desc',
			// 	},
			// })

			await prisma.log.create({
				data: {
					method: request.method,
					model,
					// register_id: request.params.id ?? null,
					api_route: request.url,
					message: convertStatusCode().message,
					// old_context: null,
					context: request.body ? JSON.stringify(request.body) : null,
					level: convertStatusCode().level,
					created_by: tokenUser.email ?? null,
				},
			})
		},
	)
}
