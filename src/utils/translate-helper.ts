const moduleNameTranslations: Record<string, string> = {
  organizations: 'Organização',
  invoices: 'Fatura',
  payments: 'Pagamento',
  roles: 'Função',
  permissions: 'Permissão',
  users: 'Usuário',
  'website-modules': 'Módulo',
  websites: 'Website',
}

export function getModuleNameTranslation(name: string): string {
  return moduleNameTranslations[name] || 'Item'
}

export function getModuleNameTranslationFromUrl(url: string): string {
  const urlMainModule = url.split('/')[1]

  return getModuleNameTranslation(urlMainModule)
}
