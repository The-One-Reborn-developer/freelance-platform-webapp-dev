import Database from "better-sqlite3";
import express from "express";
import dotenv from "dotenv";

import { 
    createUsersTable,
    createBidsTable,
    createResponsesTable  } from "./create_tables.mjs";
import { checkTelegramData } from "./check_telegram_data.mjs";
import { postUser } from "./post_user.mjs";
import { checkUserTelegram } from "./check_user_telegram.mjs";
import { getUser } from "./get_user.mjs";
import { postBid } from "./post_bid.mjs";
import { getBidsByCustomerTelegramID } from "./get_bids_by_customer_telegram_id.mjs";
import { closeBid } from "./close_bid.mjs";
import { getBidsByCity } from "./get_bids_by_city.mjs";
import { postResponse } from "./post_response.mjs";
import { sendMessage } from "./send_message.mjs";
import { saveChatMessage } from "./save_chat_message.mjs";
import { getBidByBidID } from "./get_bid_by_bid_id.mjs";

dotenv.config({ path: '/app/.env' });

const app = express();
app.use(express.json());
app.use(express.static('app/public'));
console.log('Express app created');

const db = new Database('./app/database.db', { verbose: console.log });
console.log('Database created');

createUsersTable(db);
createBidsTable(db);
createResponsesTable(db);


app.get('/', (req, res) => {
    res.sendFile('app/public/register.html', { root: './' });    
});


app.post('/check-registration', (req, res) => {
    try {
        // Check telegram data
        const checkTelegramDataResult = checkTelegramData(req, res);

        if (!checkTelegramDataResult) {
            return;
        } else {
            // Check if the user is already registered
            const checkUserTelegramResult = checkUserTelegram(db, checkTelegramDataResult.telegramID);

            if (checkUserTelegramResult.count > 0) {
                return res.status(200).json({ registered: true, telegram_id: checkTelegramDataResult.telegramID });
            } else {
                return res.status(200).json({ registered: false });
            }
        };
    } catch (error) {
        console.error('Error in /check-registration:', error);
        res.status(500).json({ message: 'Произошла ошибка при проверке регистрации пользователя.' });
    };
});


app.post('/registration-attempt', (req, res) => {
    try {
        // Check telegram data
        const checkTelegramDataResult = checkTelegramData(req, res);

        if (!checkTelegramDataResult) {
            return;
        } else {
            // Post the new user
            postUser(
                db,
                res,
                checkTelegramDataResult.telegramID,
                checkTelegramDataResult.role,
                checkTelegramDataResult.name,
                checkTelegramDataResult.rate,
                checkTelegramDataResult.experience,
            );
        };
    } catch (error) {
        console.error('Error in /registration-attempt:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
});


app.post('/get-user-data', (req, res) => {
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


app.post('/post-bid', (req, res) => {
    try {
        const customerTelegramID = req.body.customer_telegram_id;
        const customerName = req.body.customer_name;
        const city = req.body.city;
        const description = req.body.description;
        const deadlineFrom = req.body.deadline_from;
        const deadlineTo = req.body.deadline_to;
        const instrumentProvided = req.body.instrument_provided;

        // Post the new bid
        postBid(
            db,
            res,
            customerTelegramID,
            customerName,
            city,
            description,
            deadlineFrom,
            deadlineTo,
            instrumentProvided
        );
    } catch (error) {
        console.error('Error in /post-bid:', error);
        res.status(500).json({ message: 'Произошла ошибка при создании заказа.' });
    };
});


app.post('/my-bids', (req, res) => {
    try {
        const customerTelegramID = req.body.customer_telegram_id

        const bids = getBidsByCustomerTelegramID(db, customerTelegramID);

        res.status(200).json({ success: true, bids });
    } catch (error) {
        console.error('Error in /my-bids:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка заказов.' });
    }
});


app.post('/close-bid', (req, res) => {
    try {
        const bidID = req.body.bid_id;
        
        closeBid(db, bidID);
        res.status(200).json({ success: true, message: `Заказ №${bidID} успешно закрыт.` });
    } catch (error) {
        console.error('Error in /close-bid:', error);
        res.status(500).json({ message: 'Произошла ошибка при закрытии заказа.' });
    };
});


app.post('/get-bids', (req, res) => {
    try {
        const city = req.body.city;

        const bids = getBidsByCity(db, city);

        res.status(200).json({ success: true, bids });
    } catch (error) {
        console.error('Error in /get-bids:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка заказов.' });
    };
});


app.post('/respond-to-bid', (req, res) => {
    try {
        const bidID = req.body.bid_id;
        const performerTelegramID = req.body.performer_telegram_id;
        
        const performerData = getUser(db, performerTelegramID);
        const performerName = performerData.name;
        const performerRate = performerData.rate;
        const performerExperience = performerData.experience;
        
        const postResponseResult = postResponse(
            db,
            bidID,
            performerTelegramID,
            performerName,
            performerRate,
            performerExperience
        );

        if (postResponseResult === true) {
            const bidData = getBidByBidID(db, bidID);
            const customerTelegramID = bidData.customer_telegram_id;
            const customerName = bidData.customer_name;
            const city = bidData.city;
            const description = bidData.description;
            const deadlineFrom = bidData.deadline_from;
            const deadlineTo = bidData.deadline_to;
            const instrumentProvided = bidData.instrument_provided;
            const message = 'На Ваш заказ №' + bidID + ': \n\n' +
                            'Город: ' + city + '\n' +
                            'Описание: ' + description + '\n' +
                            'Срок выполнения: от<i>' + deadlineFrom + ' - до' + deadlineTo + '</i>\n' +
                            'Предоставляется инструмент: ' + (instrumentProvided ? 'да' : 'нет') + '\n\n' +
                            'Откликнулся мастер ' + performerName + ', ставка: <i>' + performerRate +
                            '/час</i>, опыт: <i>' + performerExperience + ' (в годах)</i>.';


            sendMessage(
                performerTelegramID,
                message
            );

            saveChatMessage(
                bidID,
                customerTelegramID,
                performerTelegramID,
                customerName,
                performerName,
                message,
                'performer'
            )
            
            res.status(200).json({ success: true, message: 'Ваш отклик успешно отправлен заказчику 📲' });
        } else if (postResponseResult === false) {
            res.status(409).json({ success: true, message: 'Вы уже откликнулись на этот заказ.' });
        };
    } catch (error) {
        console.error('Error in /respond-to-bid:', error);
        res.status(500).json({ message: 'Произошла ошибка при отклике на заказ.' });
    };
});


// 404 Route
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});


// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Unexpected server error.' });
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});