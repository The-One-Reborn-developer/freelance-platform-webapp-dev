import express from 'express';
import Database from 'better-sqlite3';

import {
    postPlayer
} from "../modules/game_index.mjs";


const db = new Database('./app/database.db', { verbose: console.log });

const gameRouter = express.Router();


gameRouter.post('/add-player', (req, res) => {
    try {
        console.log(req.body.player_telegram_id);
        postPlayerResult = postPlayer(db, req.body.player_telegram_id);
        
        if (postPlayerResult === 'Player already exists') {
            res.status(409).json({
                success: false,
                message: 'Вы уже добавлены в список игроков.'
            })
        } else if (postPlayerResult === false) {
            res.status(500).json({
                success: false,
                message: 'Произошла ошибка при добавлении игрока в список игроков.'
            });
        } else {
            const newPlayerID = postPlayerResult;

            res.status(201).json({
                success: true,
                message: `Игрок под номером №${newPlayerID} успешно добавлен.`
            });
        };
    } catch (error) {
        console.error(`Error in /game/add-player: ${error}`);
        res.status(500).json({ message: 'Произошла ошибка при добавлении игрока в список игроков.' });
    };
});


export default gameRouter;
