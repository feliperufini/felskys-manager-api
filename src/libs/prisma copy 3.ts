import { randomUUID } from 'node:crypto'
import { type Prisma, PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
	const before = await getBeforeState(params)

	// Executa a operação de banco de dados
	const result = await next(params)

	const after = await getAfterState(params, result)

	const registerId = getRegisterId(params, result)

	// Grava o log no banco de dados
	await createLog(params, before, after, registerId ?? '')

	return result
})

// Função para capturar o estado antes da operação
async function getBeforeState(params: Prisma.MiddlewareParams) {
	if (params.action === 'update' || params.action === 'delete') {
		const modelDelegate = prisma[params.model as keyof PrismaClient] as any
		return modelDelegate.findUnique({
			where: params.args.where,
		})
	}
	return null
}

// Função para capturar o estado depois da operação
async function getAfterState(params: Prisma.MiddlewareParams, result: any) {
	if (params.action === 'create' || params.action === 'update') {
		return result
	}
	return null
}

function getRegisterId(
	params: Prisma.MiddlewareParams,
	result: any,
): string | null {
	if (params.action === 'create') {
		return result.id // Considerando que o campo ID seja o identificador do registro criado
	} else if (params.action === 'update' || params.action === 'delete') {
		return params.args.where?.id // Considerando que o campo ID seja o identificador para update/delete
	}
	return null
}

// Função para criar o log no banco de dados
async function createLog(
	params: Prisma.MiddlewareParams,
	before: any,
	after: any,
	registerId: string,
) {
	if (['create', 'update', 'delete'].includes(params.action)) {
		if (params.model === 'Log') {
			return
		}

		const method = params.action.toUpperCase()
		const model = params.model || ''
		const apiRoute = params.args.apiRoute || 'UNKNOWN_ROUTE' // Exemplo de captura de rota

		// Crie a mensagem de log (pode ser personalizada)
		const message = `${method} on ${model}`

		// Exemplo de captura de usuário (depende da implementação)
		const createdBy = 'user-id' // Pode ser capturado de um contexto de autenticação

		// Insere o log no banco de dados
		await prisma.log.create({
			data: {
				id: randomUUID(),
				method,
				model,
				api_route: apiRoute,
				message,
				old_context: before || undefined,
				new_context: after || undefined,
				register_id: registerId,
				created_by: createdBy,
			},
		})
	}
}

export default prisma
