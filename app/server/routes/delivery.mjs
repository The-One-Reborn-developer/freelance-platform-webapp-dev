import express from 'express';
import multer from "multer";
import Database from 'better-sqlite3';

import {
    postDelivery,
    getOpenDeliveriesByCustomerTelegramID,
    updateCloseDelivery,
    getDeliveriesByCity
} from "../modules/delivery_index.mjs";


const db = new Database('./app/database.db', { verbose: console.log });

const upload = multer({ 
    dest: 'app/chats/attachments',
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB
    }
});

const deliveryRouter = express.Router();


deliveryRouter.post('/post-delivery', (req, res) => {
    try {
        const customerTelegramID = req.body.customer_telegram_id;
        const customerName = req.body.customer_name;
        const city = req.body.city;
        const description = req.body.description;
        const deliverFrom = req.body.deliver_from;
        const deliverTo = req.body.deliver_to;
        const carNecessary = req.body.car_necessary;

        // Post the new bid
        postDelivery(
            db,
            res,
            customerTelegramID,
            customerName,
            city,
            description,
            deliverFrom,
            deliverTo,
            carNecessary
        );
    } catch (error) {
        console.error('Error in /delivery/post-delivery:', error);
        res.status(500).json({ message: 'Произошла ошибка при создании заказа.' });
    };
});


deliveryRouter.post('/my-deliveries', (req, res) => {
    try {
        const customerTelegramID = req.body.customer_telegram_id

        const deliveries = getOpenDeliveriesByCustomerTelegramID(db, customerTelegramID);

        res.status(200).json({ success: true, deliveries });
    } catch (error) {
        console.error('Error in /delivery/my-deliveries:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка заказов.' });
    }
});


deliveryRouter.post('/close-delivery', (req, res) => {
    try {
        const deliveryID = req.body.delivery_id;
        
        const closeDeliveryResult = updateCloseDelivery(db, deliveryID);

        if (!closeDeliveryResult) {
            res.status(500).json({ success: false, message: 'Ошибка при закрытии заказа.' });
        } else {
            res.status(200).json({ success: true, message: `Заказ №${deliveryID} успешно закрыт.` });
        };
    } catch (error) {
        console.error('Error in /delivery/close-delivery:', error);
        res.status(500).json({ message: 'Произошла ошибка при закрытии заказа.' });
    };
});


servicesRouter.post('/get-deliveries', (req, res) => {
    try {
        const city = req.body.city;

        const deliveries = getDeliveriesByCity(db, city);

        res.status(200).json({ success: true, deliveries });
    } catch (error) {
        console.error('Error in /delivery/get-deliveries:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка заказов.' });
    };
});


export default deliveryRouter;