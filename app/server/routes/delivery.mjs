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
    saveChatMessage,
    getResponses,
    getChatMessages,
    updateResponse,
    getResponsesByCourierTelegramIDWithChatStarted,
    getResponsesByDeliveryIDWithChatStarted,
    getAllDeliveriesByCustomerTelegramID
} from "../modules/delivery_index.mjs";


const db = new Database('./app/database.db', { verbose: console.log });

const upload = multer({ 
    dest: 'app/chats/delivery/attachments',
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB
    }
});

const deliveryRouter = express.Router();


deliveryRouter.post('/upload-courier-photo', upload.single('photo'), (req, res) => {
    try {
        res.status(200).json({ success: true, message: 'Фото успешно загружено.' });
    } catch (error) {
        console.error(`Error in /delivery/upload-courier-photo: ${error}`);
        res.status(500).json({ message: 'Произошла ошибка при загрузке фото курьера.' });
    }
});


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
        const courierPhoto = `chats/delivery/attachments/${courierTelegramID}.jpg`;
 
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
                            courierCarHeight + '</i>.\n' +
                            'Фото курьера можно посмотреть в приложении.';


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

            saveChatMessage(
                deliveryID,
                customerTelegramID,
                courierTelegramID,
                customerName,
                courierName,
                null,
                courierPhoto,
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


deliveryRouter.get('/responded-couriers', (req, res) => {
    const customerTelegramID = req.query.customer_telegram_id;

    try {
        if (!customerTelegramID) {
            res.status(400).json({ message: 'Telegram ID пользователя не указан.' });
            return;
        } else {
            const customerDeliveries = getOpenDeliveriesByCustomerTelegramID(db, customerTelegramID);

            if (customerDeliveries.length === 0) {
                res.status(200).json({ success: true, couriers: [] });
                return;
            } else {
                const responses = getResponses(db, customerDeliveries);

                if (responses.length === 0) {
                    res.status(200).json({ success: true, responses: [] });
                } else {
                    res.status(200).json({ success: true, responses });
                };
            };
        };
    } catch (error) {
        console.error('Error in /delivery/responded-couriers:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка откликнувшихся курьеров.' });
    };    
});


deliveryRouter.get('/responded-customers', (req, res) => {
    const courierTelegramID = req.query.courier_telegram_id;
    
    try {
        if (!courierTelegramID) {
            res.status(400).json({ message: 'Telegram ID пользователя не указан.' });
            return;
        } else {
            const responses = getResponsesByCourierTelegramIDWithChatStarted(db, courierTelegramID);

            if (responses.length > 0) {
                const deliveryIDs = responses.map((res) => res.delivery_id);

                // Extract customer info from deliverys
                const deliveriesInfo = deliveryIDs.map((deliveryID) => {
                    const deliveryInfo = getDeliveryByDeliveryID(db, deliveryID);
                    return deliveryInfo;
                });

                res.status(200).json({ success: true, deliveriesInfo });
            } else {
                res.status(200).json({ success: true, responses: [] });
            };
        };
    } catch (error) {
        console.error('Error in /delivery/responded-customers:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка откликнувшихся заказчиков.' });
    };
});


deliveryRouter.post('/show-customer-chats-list', (req, res) => {
    try {
        const customerTelegramID = req.body.customer_telegram_id;

        // Step 1: Retrieve all deliveries created by the customer
        const customerDeliveries = getAllDeliveriesByCustomerTelegramID(db, customerTelegramID);
        if (!customerDeliveries || customerDeliveries.length === 0) {
            return res.status(200).json({ success: false });
        };

        // Step 2: Filter all deliveries to include only those with matching responses
        const deliveriesWithResponses = customerDeliveries.map((delivery) => {
            const responses = getResponsesByDeliveryIDWithChatStarted(db, delivery.id);
            if (responses && responses.length > 0) {
                return {
                    ...delivery,
                    responses: responses
                };
            } else {
                return null; // Skip deliveries without responses
            }
        }).filter(Boolean); // Filter out null entries

        // Step 3: Return only deliveries with responses
        if (deliveriesWithResponses.length > 0) {
            return res.status(200).json({ success: true, deliveries: deliveriesWithResponses });
        } else {
            return res.status(404).json({ success: false, message: 'У данного заказчика не было переписок.' });
        };
    } catch (error) {
        console.error('Error in /delivery/show-customer-chats-list:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching chat files.' });
    };
});


deliveryRouter.post('/show-courier-chats-list', (req, res) => {
    try {
        const courierTelegramID = req.body.courier_telegram_id;

        // Step 1: Retrieve all responses made by the courier with chats started
        const courierResponses = getResponsesByCourierTelegramIDWithChatStarted(db, courierTelegramID);
        if (courierResponses && courierResponses.length > 0) {
            // Step 2: Retrieve deliveries associated with the responses
            const deliveries = courierResponses.map((response) => {
                const delivery = getDeliveryByDeliveryID(db, response.delivery_id);
                return {
                    delivery
                };
            });

            // Step 3: Return the deliveries
            return res.status(200).json({ success: true, deliveries });
        } else {
            return res.status(404).json({ success: false });
        };
    } catch (error) {
        console.error('Error in /delivery/show-courier-chats-list:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching chat files.' });
    };
});


deliveryRouter.get('/get-chats', (req, res) => {
    try {
        const deliveryID = req.query.delivery_id;
        const customerTelegramID = req.query.customer_telegram_id;
        const courierTelegramID = req.query.courier_telegram_id;
        
        const chatMessages = getChatMessages(deliveryID, customerTelegramID, courierTelegramID);
        
        res.status(200).json({ success: true, chatMessages });
    } catch (error) {
        console.error(`Error in /delivery/get-chats: ${error}`);
    };
});


deliveryRouter.post('/send-message', upload.single('attachment'), (req, res) => {
    try {
        const deliveryID = req.body.delivery_id;
        const customerTelegramID = req.body.customer_telegram_id;
        const courierTelegramID = req.body.courier_telegram_id;
        const customerName = getUser(db, customerTelegramID).delivery_name;
        const courierName = getUser(db, courierTelegramID).delivery_name;
        const message = req.body.message;
        const senderType = req.body.sender_type;

        let attachmentPath = null;
        if (req.file) {
            attachmentPath = req.file.path;
        };

        saveChatMessage(
            deliveryID,
            customerTelegramID,
            courierTelegramID,
            customerName,
            courierName,
            message,
            attachmentPath,
            senderType
        );

        if (senderType === 'customer') {
            updateResponse(
                db,
                deliveryID,
                courierTelegramID,
                true
            );
        };

        const recipientTelegramID = senderType === 'customer' ? courierTelegramID : customerTelegramID;

        const formattedMessage = senderType === 'customer' ? 
            `Заказчик ${customerName}:\n${message}` :
            `Курьер ${courierName}:\n${message}`;

        const attachmentMessage = senderType === 'customer' ? 
            `Заказчик ${customerName}:\nПрислал Вам файл. Зайдите в приложение, чтобы его увидеть.` :
            `Курьер ${courierName}:\nПрислал Вам файл. Зайдите в приложение, чтобы его увидеть.`;

        if (attachmentPath) {
            sendMessage(
                recipientTelegramID,
                attachmentMessage
            );
        } else {
            sendMessage(
                recipientTelegramID,
                formattedMessage
            );
        };

        res.status(200).json({ success: true, message: 'Сообщение успешно отправлено.' });
    } catch (error) {
        console.error('Error in /delivery/send-message:', error);
        res.status(500).json({ message: 'Произошла ошибка при отправке сообщения.' });
    };
});


export default deliveryRouter;