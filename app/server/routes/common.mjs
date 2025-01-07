import express from "express";
import Database from "better-sqlite3";

import {
    checkTelegramData,
    checkUserTelegram,
    postUser,
    getUser
} from "../modules/common_index.mjs";


const db = new Database('./app/database.db', { verbose: console.log });
const commonRouter = express.Router();


commonRouter.post('/check-registration', (req, res) => {
    try {
        const telegramData = req.body.telegram_data;
        console.log(`Telegram data: ${telegramData}`);
        // Check telegram data
        const verifiedTelegramID = checkTelegramData(telegramData, res);
        console.log(`Verified Telegram ID: ${verifiedTelegramID}`);
        if (!verifiedTelegramID) {
            return;
        } else {
            // What service is the user accessing
            const service = req.body.service;

            const checkUserTelegramResult = checkUserTelegram(db, verifiedTelegramID, service);

            if (checkUserTelegramResult.count > 0) {
                return res.status(200).json({ registered: true, telegram_id: verifiedTelegramID });
            } else {
                return res.status(200).json({ registered: false, telegram_id: verifiedTelegramID });
            };
        };
    } catch (error) {
        console.error('Error in /check-registration:', error);
        res.status(500).json({ message: 'Произошла ошибка при проверке регистрации пользователя.' });
    };
});


commonRouter.post('/registration-attempt', (req, res) => {
    try {
        // Check telegram data
        const telegramData = req.body.telegram_data;
        const telegramID = checkTelegramData(telegramData, res);

        if (!telegramID) {
            console.error('Error in /registration-attempt: Telegram ID not found');
            res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
        } else {
            const {
                role,
                name,
                rate,
                experience,
                date_of_birth: dateOfBirth,
                has_car: hasCar,
                car_model: carModel,
                car_width: carWidth,
                car_length: carLength,
                car_height: carHeight,
                service
            } = req.body;

            postUser(
                db,
                res,
                telegramID,
                role,
                name,
                rate,
                experience,
                dateOfBirth,
                hasCar,
                carModel,
                carWidth,
                carLength,
                carHeight,
                service
            );
        };
    } catch (error) {
        console.error('Error in /registration-attempt:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
});


commonRouter.post('/get-user-data', (req, res) => {
    try {
        const telegramID = req.body.telegram_id;

        // Get user data
        const userData = getUser(db, telegramID);
        res.status(200).json({ success: true, userData });
    } catch (error) {
        console.error('Error in /get-user-data:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении данных пользователя.' });
    };
});


export default commonRouter;
