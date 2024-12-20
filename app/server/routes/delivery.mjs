import express from 'express';
import multer from "multer";
import Database from 'better-sqlite3';

import {
    getUser,
    sendMessage
} from "../modules/common_index.mjs"

import {
    postDelivery,
    getOpenDeliveriesByCustomerTelegramID,
    updateCloseDelivery,
    getDeliveriesByCity,
    postResponse,
    getDeliveryByDeliveryID,
    saveChatMessage
} from "../modules/delivery_index.mjs";


const db = new Database('./app/database.db', { verbose: console.log });

const upload = multer({ 
    dest: 'app/delivery/chats/attachments',
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

        // Post the new delivery
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


deliveryRouter.post('/get-deliveries', (req, res) => {
    try {
        const city = req.body.city;

        const deliveries = getDeliveriesByCity(db, city);

        res.status(200).json({ success: true, deliveries });
    } catch (error) {
        console.error('Error in /delivery/get-deliveries:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка заказов.' });
    };
});


deliveryRouter.post('/respond-to-delivery', (req, res) => {
    try {
        const deliveryID = req.body.delivery_id;
        const courierTelegramID = req.body.courier_telegram_id;
        const courierData = getUser(db, courierTelegramID);
        const courierName = courierData.delivery_name;
        const courierDateOfBirth = courierData.date_of_birth;
        const courierHasCar = courierData.has_car;
        const courierCarModel = courierData.car_model;
        const courierCarWidth = courierData.car_width;
        const courierCarLength = courierData.car_length;
        const courierCarHeight = courierData.car_height;
        const courierRegistrationDate = courierData.delivery_registration_date;
        
        const postResponseResult = postResponse(
            db,
            deliveryID,
            courierTelegramID,
            courierName,
            courierDateOfBirth,
            courierHasCar,
            courierCarModel,
            courierCarWidth,
            courierCarLength,
            courierCarHeight,
            courierRegistrationDate
        );

        if (postResponseResult === true) {
            const deliveryData = getDeliveryByDeliveryID(db, deliveryID);
            const customerTelegramID = deliveryData.customer_telegram_id;
            const customerName = deliveryData.customer_name;
            const city = deliveryData.city;
            const description = deliveryData.description;
            const deliverFrom = deliveryData.deliver_from;
            const deliverTo = deliveryData.deliver_to;
            const carNecessary = deliveryData.car_necessary;
            const message = 'На Ваш заказ №' + deliveryID + ': \n\n' +
                            'Город: ' + city + '\n' +
                            'Что нужно доставить, описание: ' + description + '\n' +
                            'Откуда: ' + deliverFrom + '.\n' + 'Куда: ' + deliverTo + '\n' +
                            'Нужна машина: ' + ((carNecessary === 1) ? 'да' : 'нет') + '\n\n' +
                            'Откликнулся исполнитель ' + courierName + '. Зарегистрирован с <i>' + courierRegistrationDate + '</i>. '+
                            'Есть машина: <i>' + ((courierHasCar === 1) ? 'да' : 'нет') + '</i>, модель: <i>' +
                            courierCarModel + '</i>, габариты: <i>' + courierCarWidth + 'x' + courierCarLength + 'x' + 
                            courierCarHeight + '</i>';


            sendMessage(
                customerTelegramID,
                message
            );

            saveChatMessage(
                deliveryID,
                customerTelegramID,
                courierTelegramID,
                customerName,
                courierName,
                message,
                null,
                'courier'
            );
            
            res.status(200).json({ success: true, message: 'Ваш отклик успешно отправлен заказчику 📲' });
        } else if (postResponseResult === false) {
            res.status(409).json({ success: true, message: 'Вы уже откликнулись на этот заказ.' });
        };
    } catch (error) {
        console.error('Error in /delivery/respond-to-delivery:', error);
        res.status(500).json({ message: 'Произошла ошибка при отклике на заказ.' });
    };
});


export default deliveryRouter;