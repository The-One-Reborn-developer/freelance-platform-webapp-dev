import express from "express";

import {
    checkTelegramData,
    checkUserTelegram,
    postUser,
    getUser
} from "../modules/common_index.mjs";


const commonRouter = express.Router();


router.post('/check-registration', (req, res) => {
    try {
        const telegramData = req.body.telegram_data;
        // Check telegram data
        const verifiedTelegramID = checkTelegramData(telegramData, res);

        if (!verifiedTelegramID) {
            return;
        } else {
            // What service is the user accessing
            const service = req.body.service;

            const checkUserTelegramResult = checkUserTelegram(db, verifiedTelegramID, service);

            if (checkUserTelegramResult.count > 0) {
                return res.status(200).json({ registered: true, telegram_id: verifiedTelegramID });
            } else {
                return res.status(200).json({ registered: false });
            };
        };
    } catch (error) {
        console.error('Error in /check-registration:', error);
        res.status(500).json({ message: 'Произошла ошибка при проверке регистрации пользователя.' });
    };
});


router.post('/registration-attempt', (req, res) => {
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
                car_dimensions_width: carDimensionsWidth,
                car_dimensions_length: carDimensionsLength,
                car_dimensions_height: carDimensionsHeight,
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
                carDimensionsWidth,
                carDimensionsLength,
                carDimensionsHeight,
                service
            );
        };
    } catch (error) {
        console.error('Error in /registration-attempt:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
});


router.post('/get-user-data', (req, res) => {
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