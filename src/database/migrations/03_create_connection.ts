import Knex from 'knex';

export async function up(knex: Knex) { //recebendo a conexão com o banco
    return knex.schema.createTable('connections', table => {
        table.increments('id').primary();

        table.integer('user_id') //criando relacionamento entre tabelas
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

            table.timestamp('created_at')
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
                .notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('connections');
}