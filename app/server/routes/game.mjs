import express from 'express';
import Database from 'better-sqlite3';

import {
    postPlayer,
    getPlayersAmount,
    getNextGameSession
} from "../modules/game_index.mjs";


const db = new Database('./app/database.db', { verbose: console.log });
const gameRouter = express.Router();


gameRouter.post('/add-player', (req, res) => {
    try {
        if (!req.body.player_telegram_id || !req.body.player_name || !req.body.session_id) {
            res.status(400).json({
                success: false,
                message: 'Недостаточно данных для добавления игрока в список игроков.'
            });
            return;
        };
        
        const postPlayerResult = postPlayer(
            db,
            req.body.session_id,
            req.body.player_telegram_id,
            req.body.player_name
        );

        res.status(postPlayerResult.status).json(postPlayerResult);
    } catch (error) {
        console.error(`Error in /game/add-player: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при добавлении игрока в список игроков.'
        });
    };
});


gameRouter.get('/get-players-amount', (req, res) => {
    try {
        const getPlayersAmountResult = getPlayersAmount(db, req.query.session_id);

        res.status(getPlayersAmountResult.status).json(getPlayersAmountResult);
    } catch (error) {
        console.error(`Error in /game/get-players-amount: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при получении количества игроков.'
        });
    };
});


gameRouter.get('/get-next-game-session', (req, res) => {
    try {
        const getNextGameSessionResult = getNextGameSession(db);

        res.status(getNextGameSessionResult.status).json(getNextGameSessionResult);
    } catch (error) {
        console.error(`Error in /game/get-next-game-session: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при получении игрового сеанса.'
        });
    };
});


export default gameRouter;
