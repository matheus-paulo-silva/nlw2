import {Request, Response} from 'express'

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string,
    to: string,
}

export default class ClassesController {
    async index(req: Request, res: Response) {
        const filters = req.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if (!filters.week_day || !filters.subject || !filters.time ) {
            return res.status(400).json({
                error: 'Missing filters to search classes'
            });
        }

        const timeInMinutes = convertHourToMinutes(time);

        const classes = await db('classes')
            .whereExists(function() { //query verificando se existe um horario disponivel
                this.select('class_schedule.*') //selecionando todos os campos da tabela schedule
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`') //procurando dentro da tabela schedule todos os ids que estão na classes.id
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)]) //buscar somente os class schedule em que o dia da semana for igual ao que eu quero filtrar 
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes]) //esperar que o professor começa a trabalhar antes ou igual ao tempo 
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]) //só pode ser marcado horario antes do professor parar de trabalhar
            })
            .where('classes.subject', '=', subject) //verificando se a máteria baste
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);


        return res.json(classes);
    }

    

    async create(req: Request, res: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = req.body;
    
        const trx = await db.transaction(); //criando a transaction
    
        try {
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio
            });
        
            const user_id = insertedUsersIds[0];
        
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            });
        
            const class_id = insertedClassesIds[0];
        
            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to),
                };
            })
        
            await trx('class_schedule').insert(classSchedule);
        
            await trx.commit(); //momento onde a transaction dá o commit e insere tudo ao mesmo tempo no banco
        
            return res.status(201).send();
        } catch (err) {
            await trx.rollback();
    
            return res.status(400).json({
                error: 'Unexpected error while creating new class'
            })
        }
    }
}