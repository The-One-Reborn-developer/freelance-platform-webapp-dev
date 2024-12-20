import express from "express";
import multer from "multer";
import Database from "better-sqlite3";

import {
    getAllBidsByCustomerTelegramID,
    getBidsByCity,
    getChatMessages,
    getOpenBidsByCustomerTelegramID,
    getResponses,
    getBidByBidID,
    getResponsesByBidIDWithChatStarted,
    getResponsesByPerformerTelegramIDWithChatStarted,
    postBid,
    postResponse,
    saveChatMessage,
    sendAttachment,
    updateCloseBid,
    updateProfileInfo,
    updateResponse
} from "../modules/services_index.mjs"

import { 
    getUser,
    sendMessage
} from "../modules/common_index.mjs"


const db = new Database('./app/database.db', { verbose: console.log });
const upload = multer({ 
    dest: 'app/services/chats/attachments',
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB
    }
});


const servicesRouter = express.Router();


servicesRouter.post('/post-bid', (req, res) => {
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


servicesRouter.post('/my-bids', (req, res) => {
    try {
        const customerTelegramID = req.body.customer_telegram_id

        const bids = getOpenBidsByCustomerTelegramID(db, customerTelegramID);

        res.status(200).json({ success: true, bids });
    } catch (error) {
        console.error('Error in /my-bids:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка заказов.' });
    }
});


servicesRouter.post('/close-bid', (req, res) => {
    try {
        const bidID = req.body.bid_id;
        
        const closeBidResult = updateCloseBid(db, bidID);

        if (!closeBidResult) {
            res.status(500).json({ success: false, message: 'Ошибка при закрытии заказа.' });
        } else {
            res.status(200).json({ success: true, message: `Заказ №${bidID} успешно закрыт.` });
        };
    } catch (error) {
        console.error('Error in /close-bid:', error);
        res.status(500).json({ message: 'Произошла ошибка при закрытии заказа.' });
    };
});


servicesRouter.post('/get-bids', (req, res) => {
    try {
        const city = req.body.city;

        const bids = getBidsByCity(db, city);

        res.status(200).json({ success: true, bids });
    } catch (error) {
        console.error('Error in /get-bids:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка заказов.' });
    };
});


servicesRouter.post('/respond-to-bid', (req, res) => {
    try {
        const bidID = req.body.bid_id;
        const performerTelegramID = req.body.performer_telegram_id;
        
        const performerData = getUser(db, performerTelegramID);
        const performerName = performerData.services_name;
        const performerRate = performerData.rate;
        const performerExperience = performerData.experience;
        const performerRegistrationDate = performerData.services_registration_date;
        
        const postResponseResult = postResponse(
            db,
            bidID,
            performerTelegramID,
            performerName,
            performerRate,
            performerExperience,
            performerRegistrationDate
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
                            'Срок выполнения: от <i>' + deadlineFrom + ' - до ' + deadlineTo + '</i>\n' +
                            'Предоставляется инструмент: ' + ((instrumentProvided === true || instrumentProvided === 1) ? 'да' : 'нет') + '\n\n' +
                            'Откликнулся исполнитель ' + performerName + '. Зарегистрирован с <i>' + performerRegistrationDate + '</i>. '+
                            'ставка: <i>' + performerRate +
                            '/час</i>, опыт: <i>' + performerExperience + ' (в годах)</i>.';


            sendMessage(
                customerTelegramID,
                message
            );

            saveChatMessage(
                bidID,
                customerTelegramID,
                performerTelegramID,
                customerName,
                performerName,
                message,
                null,
                'performer'
            );
            
            res.status(200).json({ success: true, message: 'Ваш отклик успешно отправлен заказчику 📲' });
        } else if (postResponseResult === false) {
            res.status(409).json({ success: true, message: 'Вы уже откликнулись на этот заказ.' });
        };
    } catch (error) {
        console.error('Error in /respond-to-bid:', error);
        res.status(500).json({ message: 'Произошла ошибка при отклике на заказ.' });
    };
});


servicesRouter.get('/responded-performers', (req, res) => {
    const customerTelegramID = req.query.customer_telegram_id;

    try {
        if (!customerTelegramID) {
            res.status(400).json({ message: 'Telegram ID пользователя не указан.' });
            return;
        } else {
            const customerBids = getOpenBidsByCustomerTelegramID(db, customerTelegramID);

            if (customerBids.length === 0) {
                res.status(200).json({ success: true, performers: [] });
                return;
            } else {
                const responses = getResponses(db, customerBids);

                if (responses.length === 0) {
                    res.status(200).json({ success: true, responses: [] });
                } else {
                    res.status(200).json({ success: true, responses });
                };
            };
        };
    } catch (error) {
        console.error('Error in /responded-performers:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка откликнувшихся исполнителей.' });
    };    
});


servicesRouter.get('/get-chats', (req, res) => {
    try {
        const bidID = req.query.bid_id;
        const customerTelegramID = req.query.customer_telegram_id;
        const performerTelegramID = req.query.performer_telegram_id;

        const chatMessages = getChatMessages(bidID, customerTelegramID, performerTelegramID);

        res.status(200).json({ success: true, chatMessages });
    } catch (error) {
        console.error(`Error in /get-chats: ${error}`);
    }
});


servicesRouter.post('/show-customer-chats-list', (req, res) => {
    try {
        const customerTelegramID = req.body.customer_telegram_id;

        // Step 1: Retrieve all bids created by the customer
        const customerBids = getAllBidsByCustomerTelegramID(db, customerTelegramID);
        if (!customerBids || customerBids.length === 0) {
            return res.status(200).json({ success: false });
        };

        // Step 2: Filter all bids to include only those with matching responses
        const bidsWithResponses = customerBids.map((bid) => {
            const responses = getResponsesByBidIDWithChatStarted(db, bid.id);
            if (responses && responses.length > 0) {
                return {
                    ...bid,
                    responses: responses
                };
            } else {
                return null; // Skip bids without responses
            }
        }).filter(Boolean); // Filter out null entries

        // Step 3: Return only bids with responses
        if (bidsWithResponses.length > 0) {
            return res.status(200).json({ success: true, bids: bidsWithResponses });
        } else {
            return res.status(404).json({ success: false, message: 'У данного заказчика не было переписок.' });
        };
    } catch (error) {
        console.error('Error in /show-customer-chats-list:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching chat files.' });
    };
});


servicesRouter.post('/show-performer-chats-list', (req, res) => {
    try {
        const performerTelegramID = req.body.performer_telegram_id;

        // Step 1: Retrieve all responses made by the performer with chats started
        const performerResponses = getResponsesByPerformerTelegramIDWithChatStarted(db, performerTelegramID);
        if (performerResponses && performerResponses.length > 0) {
            // Step 2: Retrieve bids associated with the responses
            const bids = performerResponses.map((response) => {
                const bid = getBidByBidID(db, response.bid_id);
                return {
                    bid
                };
            });

            // Step 3: Return the bids
            return res.status(200).json({ success: true, bids });
        } else {
            return res.status(404).json({ success: false });
        };
    } catch (error) {
        console.error('Error in /show-performer-chats-list:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching chat files.' });
    };
});


servicesRouter.post('/send-message', upload.single('attachment'), (req, res) => {
    try {
        const bidID = req.body.bid_id;
        const customerTelegramID = req.body.customer_telegram_id;
        const performerTelegramID = req.body.performer_telegram_id;
        const customerName = getUser(db, customerTelegramID).services_name;
        const performerName = getUser(db, performerTelegramID).services_name;
        const message = req.body.message;
        const senderType = req.body.sender_type;

        let attachmentPath = null;
        if (req.file) {
            attachmentPath = req.file.path;
        };

        saveChatMessage(
            bidID,
            customerTelegramID,
            performerTelegramID,
            customerName,
            performerName,
            message,
            attachmentPath,
            senderType
        );

        if (senderType === 'customer') {
            updateResponse(
                db,
                bidID,
                performerTelegramID,
                true
            );
        };

        const recipientTelegramID = senderType === 'customer' ? performerTelegramID : customerTelegramID;

        const formattedMessage = senderType === 'customer' ? 
            `Заказчик ${customerName}:\n${message}` :
            `Исполнитель ${performerName}:\n${message}`;

        if (attachmentPath) {
            sendAttachment(
                recipientTelegramID,
                attachmentPath
            );
        } else {
            sendMessage(
                recipientTelegramID,
                formattedMessage
            );
        };

        res.status(200).json({ success: true, message: 'Сообщение успешно отправлено.' });
    } catch (error) {
        console.error('Error in /send-message:', error);
        res.status(500).json({ message: 'Произошла ошибка при отправке сообщения.' });
    };
});


servicesRouter.post('/change-profile-info', (req, res) => {
    try {
        const telegramID = req.body.telegram_id;
        const rate = req.body.rate;
        const experience = req.body.experience;

        const updateProfileInfoResult = updateProfileInfo(db, telegramID, rate, experience);

        if (!updateProfileInfoResult) {
            res.status(500).json({ message: 'Произошла ошибка при изменении информации о профиле.' });
        } else {
            res.status(200).json({ success: true, message: 'Информация о профиле успешно изменена.' });
        };
    } catch (error) {
        console.error('Error in /change-profile-info:', error);
        res.status(500).json({ message: 'Произошла ошибка при изменении информации о профиле.' });
    };
});


servicesRouter.get('/responded-customers', (req, res) => {
    const performerTelegramID = req.query.performer_telegram_id;

    try {
        if (!performerTelegramID) {
            res.status(400).json({ message: 'Telegram ID пользователя не указан.' });
            return;
        } else {
            const responses = getResponsesByPerformerTelegramIDWithChatStarted(db, performerTelegramID);
            
            if (responses.length > 0) {
                const bidIDs = responses.map((res) => res.bid_id);

                // Extract customer info from bids
                const bidsInfo = bidIDs.map((bidID) => {
                    const bidInfo = getBidByBidID(db, bidID);
                    return bidInfo;
                });

                res.status(200).json({ success: true, bidsInfo });
            } else {
                res.status(200).json({ success: true, responses: [] });
            }
        };
    } catch (error) {
        console.error('Error in /responded-customers:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка откликнувшихся заказчиков.' });
    };
});


export default servicesRouter;