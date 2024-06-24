// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    organizations: {
      id: string
      legal_name: string
      business_name: string
      document: string
      status: boolean
      created_at: string
      updated_at: string
      // updated_at?: string /* (?) Interrogação se o campo for nullable */
    }
  }
}
