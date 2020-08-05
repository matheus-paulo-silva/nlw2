import {Request, Response } from 'express'; 
import db from '../database/connection';



export default class ConnectionController {
    async index(req: Request, res: Response) {

       const totalConnections = await db('connections').count('* as total '); //contando quantos registros tem no banco e jogando para uma variavel total

       const { total } = totalConnections[0]; //sempre que tiver somente uma coluna a ser retornada deve ser pasado em um array  a posição 0

       return res.json({ total });

    }


    async create(req: Request, res: Response) {
        const { user_id } = req.body;

        await db('connections').insert({
            user_id,
        })

        return res.status(201).send();
    }
}
