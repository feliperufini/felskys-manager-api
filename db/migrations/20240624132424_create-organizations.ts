import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('organizations', (table) => {
    table.uuid('id').primary().notNullable()
    table.string('legal_name', 90).notNullable()
    table.string('business_name', 90).notNullable()
    table.string('document', 14).notNullable()
    table.boolean('status').defaultTo(true).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('organizations')
}
