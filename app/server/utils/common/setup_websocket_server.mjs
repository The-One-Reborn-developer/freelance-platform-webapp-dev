import { WebSocketServer } from "ws";
import Database from 'better-sqlite3';

import { deletePlayer, getGameSessionByID } from "../../modules/game_index.mjs";
import { toZonedTime } from 'date-fns-tz';
import { WebSocket } from "ws";

const db = new Database('./app/database.db', { verbose: console.log });
const MOSCOW_TIMEZONE = 'Europe/Moscow';
const TIMER_UPDATE_INTERVAL = 1000; // 1 second


export function setupWebsocketServer(server) {
    const wss = new WebSocketServer({ server });
    const users = new Map();
    const gameSessionSubscriptions = new Map();

    setInterval(() => broadcastTimers(db, gameSessionSubscriptions, users), TIMER_UPDATE_INTERVAL);

    wss.on('connection', (ws, req) => {
        const params = new URLSearchParams(req.url.split('?')[1]);
        const telegramID = String(params.get('telegram_id'));
        const service = String(params.get('service'));
        const sessionID = service === 'game' ? String(params.get('session_id')) : null;
        
        // Establish connection
        handleConnection(ws, users, gameSessionSubscriptions, telegramID, service, sessionID);

        // Handle incoming messages
        ws.on('message', (rawMessage) => {
            handleIncomingMessage(ws, telegramID, rawMessage);
        });

        // Handle disconnections
        ws.on('close', (code, reason) => {
            handleDisconnection(users, telegramID, sessionID, service, code, reason);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`WebSocket error for Telegram ID ${telegramID}: ${error.message}`);
        });
    });

    // Send message to a specific user
    function sendMessageToUser (recipientTelegramIDString, message) {
        const user = users.get(recipientTelegramIDString);
        if (user) {
            user.send(JSON.stringify(message));
        } else {
            console.error(`User with Telegram ID ${recipientTelegramIDString} is not connected.`);
        };
    };

    return { sendMessageToUser };
};


function broadcastTimers(db, gameSessionSubscriptions, users) {
    for (const [sessionID, subscribers] of gameSessionSubscriptions.entries()) {
        if (!subscribers || subscribers.size === 0) {
            gameSessionSubscriptions.delete(sessionID);
            continue;
        };

        const gameSession = getGameSessionByID(db, sessionID);
        if (!gameSession.success) {
            console.error(`Error getting game session by ID ${sessionID}: ${gameSession.message}`);
            continue;
        };

        const now = toZonedTime(new Date(), MOSCOW_TIMEZONE);
        const sessionDate = new Date(gameSession.gameSession.session_date);
        const countdownMinutes = gameSession.gameSession.countdown_timer || 0;
        
        const endTime = new Date(sessionDate);
        endTime.setMinutes(endTime.getMinutes() + countdownMinutes);
        
        let remainingTime = 0;
        let status = 'finished';
        
        if (!gameSession.gameSession.started) {
            remainingTime = Math.max((sessionDate - now) / 1000, 0);
            status = remainingTime > 0 ? 'pending' : 'finished';
        } else if (gameSession.gameSession.started && !gameSession.gameSession.finished) {
            remainingTime = Math.max((endTime - now) / 1000, 0);
            status = remainingTime > 0 ? 'ongoing' : 'finished';
        };
        
        for (const telegramID of subscribers) {
            const user = users.get(telegramID);
            if (user && user.readyState === WebSocket.OPEN) {
                user.send(JSON.stringify({
                    success: true,
                    status: status,
                    session_id: sessionID,
                    remaining_time: Math.round(remainingTime),
                    start_time: sessionDate.toISOString(),
                    end_time: endTime.toISOString()
                }));
            };
        };
    };
};


function handleConnection(ws, users, gameSessionSubscriptions, telegramID, service, sessionID) {
    try {
        if (!telegramID || !service) {
            ws.close(1008, `Missing ${telegramID ? 'service' : 'telegram_id'} parameter`);
            return;
        };

        if (users.has(telegramID)) {
            const existingSocket = users.get(telegramID);

            if (existingSocket.readyState === WebSocket.OPEN) {
                console.warn(`Duplicate connection for Telegram ID: ${telegramID}. Closing the old connection.`);
                existingSocket.close(1000, 'Duplicate connection detected'); // Close the previous connection
            };

            users.delete(telegramID);
        };

        users.set(telegramID, ws);
        console.log(`WebSocket connection established for Telegram ID: ${telegramID}. Service: ${service}. Session ID: ${sessionID}`);

        if (service === 'game' && sessionID) {
            if (!gameSessionSubscriptions.has(sessionID)) {
                gameSessionSubscriptions.set(sessionID, new Set());
            };

            gameSessionSubscriptions.get(sessionID).add(telegramID);
            console.log(`User ${telegramID} subscribed to game session ${sessionID}`);
        }
    } catch (error) {
        console.error(`Error establishing WebSocket connection for Telegram ID ${telegramID}: ${error}`);
    };
};


function handleIncomingMessage(ws, telegramID, rawMessage) {
    try {
        const {
            recipient_telegram_id: recipientTelegramID,
            sender_name: senderName,
            message: messageContent,
            attachment
        } = JSON.parse(rawMessage);
        const recipientTelegramIDString = String(recipientTelegramID);

        if (!recipientTelegramID || !String(senderName).trim() || !String(messageContent).trim()) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
            return;
        } else {
            sendMessageToUser(
                recipientTelegramIDString,
                {
                    sender_telegram_id: telegramID,
                    sender_name: senderName,
                    message: messageContent,
                    attachment
                }
            );
        };
    } catch (error) {
        console.error(`Error parsing message from Telegram ID ${telegramID}: ${error}`);
        ws.send(JSON.stringify({ error: 'Failed to parse message' }));
    };
};


function handleDisconnection(users, telegramID, sessionID, service, code, reason) {
    users.delete(telegramID);
    try {
        if (service === 'game' && sessionID) {
            const subscribers = gameSessionSubscriptions.get(sessionID);
            
            if (subscribers) {
                subscribers.delete(telegramID);
            
                if (subscribers.size === 0) {
                    gameSessionSubscriptions.delete(sessionID);
                };
            };

            const deletePlayerResult = deletePlayer(db, telegramID, sessionID);
            console.log(`Delete player result: ${deletePlayerResult.success}, ${deletePlayerResult.status}. ${deletePlayerResult.message}`);
        };
        console.log(`WebSocket closed for Telegram ID ${telegramID}. Code: ${code}, Reason: ${reason}`);
    } catch (error) {
        console.error(`Error closing WebSocket for Telegram ID ${telegramID}: ${error}`);
    };
};
