import knex from 'knex';
import path from 'path';

//migrations basicamente controlam a versão do banco de dados

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true, //utilizar nulo quando nao conseguir definir o conteudo padrão no banco de dados
});

export default db;