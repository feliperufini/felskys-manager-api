const modelNameTranslations: Record<string, string> = {
	organizations: 'Organização',
	Organization: 'Organização',
	invoices: 'Fatura',
	Invoice: 'Fatura',
	payments: 'Pagamento',
	Payment: 'Pagamento',
	roles: 'Função',
	Role: 'Função',
	permissions: 'Permissão',
	Permission: 'Permissão',
	users: 'Usuário',
	User: 'Usuário',
	'website-modules': 'Módulo',
	WebsiteModule: 'Módulo',
	websites: 'Website',
	Website: 'Website',
}

const modelNameDatabase: Record<string, string> = {
	organizations: 'Organization',
	invoices: 'Invoice',
	payments: 'Payment',
	roles: 'Role',
	permissions: 'Permission',
	users: 'User',
	'website-modules': 'WebsiteModule',
	websites: 'Website',
}

export function getModelNameTranslated(name: string): string {
	return modelNameTranslations[name] || 'Item'
}

export function getModelNameTranslatedFromUrl(url: string): string {
	const urlMainModel = url.split('/')[1]

	return getModelNameTranslated(urlMainModel)
}

export function getModelNameDatabase(name: string): string {
	return modelNameDatabase[name] || 'NOT_FOUND'
}
