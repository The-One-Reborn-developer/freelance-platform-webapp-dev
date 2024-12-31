import express from 'express';
import Database from 'better-sqlite3';

import {
    postGameSession,
    postPlayer,
    getPlayersAmount,
    getNextGameSessionDate
} from "../modules/game_index.mjs";
import { get } from 'http';


const db = new Database('./app/database.db', { verbose: console.log });

const gameRouter = express.Router();


gameRouter.post('/add-player', (req, res) => {
    try {
        // TODO: remove temporary game session adding
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        postGameSession(db, tomorrow.toISOString().split('T')[0]);

        if (!req.body.player_telegram_id || !req.body.player_name) {
            res.status(400).json({
                success: false,
                message: 'Недостаточно данных для добавления игрока в список игроков.'
            });
            return;
        };

        const result = postPlayer(
            db,
            req.body.player_telegram_id,
            req.body.player_name
        );

        res.status(result.status).json(result);
    } catch (error) {
        console.error(`Error in /game/add-player: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при добавлении игрока в список игроков.'
        });
    };
});


gameRouter.get('/get-players-amount', (res) => {
    try {
        const result = getPlayersAmount(db);

        res.status(result.status).json(result);
    } catch (error) {
        console.error(`Error in /game/get-players-amount: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при получении количества игроков.'
        });
    };
});


gameRouter.get('/get-next-game-session-date', (res) => {
    try {
        const response = getNextGameSessionDate(db);

        res.status(response.status).json(response);
    } catch (error) {
        console.error(`Error in /game/get-next-game-session-date: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при получении даты следующего игрового сеанса.'
        });
    };
});


export default gameRouter;
