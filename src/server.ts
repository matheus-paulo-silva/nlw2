import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json()); //app introduzindo o json no express para que ele conversa tudo para json
app.use(routes);

// Corpo ( Request Body): Dados para criação ou atualização de um registro
// Route Params: Identificar qual recurso eu quero atualizar ou deletar, para acessar utilizar req.params
// Query Params : Paginação, filtros, ordenação, para acessar utilizar req.query




app.listen(3333);