import express from 'express';
import multer from "multer";

import {
    postDelivery
} from "../modules/delivery_index.mjs";

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
        console.error('Error in /post-delivery:', error);
        res.status(500).json({ message: 'Произошла ошибка при создании заказа.' });
    };
});


export default deliveryRouter;