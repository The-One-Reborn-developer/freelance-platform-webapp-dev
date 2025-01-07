import { WebSocketServer } from "ws";
import Database from 'better-sqlite3';
import { toZonedTime } from 'date-fns-tz';
import { WebSocket } from "ws";

import { 
    deletePlayer,
    getGameSessionByID,
    getPlayersAmount,
    getGameSessionAd,
    insertGameChoice,
    getPlayersGameChoices,
    decideRandomWin
} from "../../modules/game_index.mjs";


const db = new Database('./app/database.db', { verbose: console.log });
const MOSCOW_TIMEZONE = 'Europe/Moscow';
const TIMER_UPDATE_INTERVAL = 1000; // 1 second


export function setupWebsocketServer(server) {
    const wss = new WebSocketServer({ server });
    const users = new Map();
    const gameSessionSubscriptions = new Map();

    setInterval(() => broadcastTimers(db, gameSessionSubscriptions, users), TIMER_UPDATE_INTERVAL);
    setInterval(() => broadcastPlayersAmount(db, gameSessionSubscriptions, users), TIMER_UPDATE_INTERVAL);

    // Heartbeat mechanism to remove stale connections
    setInterval(() => {
        users.forEach((socket, telegramID) => {
            if (socket.readyState !== WebSocket.OPEN) {
                console.log(`Removing stale connection: ${telegramID}`);
                users.delete(telegramID);
            } else {
                try {
                    socket.ping(); // Keep connection alive
                } catch (error) {
                    console.error(`Error during ping for ${telegramID}: ${error.message}`);
                }
            }
        });
    }, 30000); // Every 30 seconds

    wss.on('connection', (ws, req) => {
        const params = new URLSearchParams(req.url.split('?')[1]);
        const telegramID = String(params.get('telegram_id'));
        const service = String(params.get('service'));
        const type = String(params.get('type'));
        const sessionID = String(params.get('session_id'));

        // Establish connection
        handleConnection(ws, users, gameSessionSubscriptions, telegramID, service, type, sessionID);

        // Handle incoming messages
        ws.on('message', (rawMessage) => {
            handleIncomingMessage(ws, users, gameSessionSubscriptions, telegramID, rawMessage);
        });

        // Handle disconnections
        ws.on('close', (code, reason) => {
            handleDisconnection(users, gameSessionSubscriptions, telegramID, sessionID, service, code, reason);
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


function broadcastPlayersAmount(db, gameSessionSubscriptions, users) {
    for (const [sessionID, subscribers] of gameSessionSubscriptions.entries()) {
        if (!subscribers || subscribers.size === 0) {
            gameSessionSubscriptions.delete(sessionID);
            continue;
        };

        const getPlayersAmountResult = getPlayersAmount(db, sessionID);

        if (!getPlayersAmountResult.success) {
            console.error(`Error getting players amount for game session ${sessionID}: ${getPlayersAmountResult.message}`);
            continue;
        };

        const playersAmount = getPlayersAmountResult.playersAmount;

        for (const telegramID of subscribers) {
            const user = users.get(telegramID);
            if (user && user.readyState === WebSocket.OPEN) {
                user.send(JSON.stringify({
                    success: true,
                    type: 'players_amount_update',
                    session_id: sessionID,
                    players_amount: playersAmount
                }));
            };
        };
    };
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
                    type: 'timer_update',
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


function broadcastGameSessionAd(db, gameSessionSubscriptions, users, sessionID) {
    try {
        const gameSessionAd = getGameSessionAd(db, sessionID);

        if (!gameSessionAd.success) {
            console.error(`Error getting game session ad for session ID ${sessionID}: ${gameSessionAd.message}`);
            return;
        };

        const sessionSuscribers = gameSessionSubscriptions.get(sessionID);
        if (!sessionSuscribers || sessionSuscribers.size === 0) {
            console.warn(`No subscribers for session ID ${sessionID}`);
            return;
        };
        
        for (const telegramID of sessionSuscribers) {
            const user = users.get(telegramID);
            if (user && user.readyState === WebSocket.OPEN) {
                user.send(JSON.stringify({
                    success: true,
                    type: 'game_session_ad',
                    ad: gameSessionAd.ad
                }));
            };
        };

        console.log(`Game session ad for session ID ${sessionID} broadcasted successfully`);
        return true;
    } catch (error) {
        console.error(`Error broadcasting game session ad for session ${sessionID}: ${error}`);
        return false;
    };
};


function handleConnection(ws, users, gameSessionSubscriptions, telegramID, service, type, sessionID) {
    try {
        if (!service) {
            ws.close(1008, `Missing service parameter`);
            return;
        };

        if (service ==='runner') {
            console.log(`WebSocket connection established for ${service} service. Type: ${type}`);

            if (type === 'game-session-start') {
                if (!sessionID) {
                    console.error(`Attempt to start game session without session ID`);
                } else {
                    broadcastGameSessionAd(db, gameSessionSubscriptions, users, sessionID);
                };
            };

            return;
        };

        if (!telegramID) {
            ws.close(1008, 'Missing telegram_id parameter');
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

        if (service === 'game' && sessionID) {
            if (!gameSessionSubscriptions.has(sessionID)) {
                gameSessionSubscriptions.set(sessionID, new Set());
            };

            gameSessionSubscriptions.get(sessionID).add(telegramID);
            console.log(`WebSocket connection established for Telegram ID: ${telegramID}. Service: ${service}. Session ID: ${sessionID}`);
        };

        console.log(`Users map after establishing connection: ${JSON.stringify(Object.fromEntries(users))}`);
        console.log(
            `Game session subscriptions map after establishing connection: ${JSON.stringify(
                Object.fromEntries(
                    Array.from(gameSessionSubscriptions, ([key, value]) => [key, Array.from(value)])
                )
            )}`
        );
    } catch (error) {
        console.error(`Error establishing WebSocket connection.`);
    };
};


function handleIncomingMessage(ws, users, gameSessionSubscriptions, telegramID, rawMessage) {
    try {
        const messageData = JSON.parse(rawMessage);

        if (messageData.type === 'game_session_start') {
            const { session_id, session_date } = messageData;

            if (!session_id || !session_date) {
                ws.send(JSON.stringify({ error: 'Invalid game session start format' }));
                return;
            };

            console.log(`Game session started for session ID: ${session_id}. Date: ${session_date}`);

            // Broadcast the game start to all subscribers of the given session
            const subscribers = gameSessionSubscriptions.get(session_id);
            if (subscribers) {
                subscribers.forEach(subscriberTelegramID => {
                    const subscriber = users.get(subscriberTelegramID);
                    if (subscriber && subscriber.readyState === WebSocket.OPEN) {
                        subscriber.send(JSON.stringify({
                            success: true,
                            type: 'game_session_start',
                            session_id: session_id,
                        }));
                    };
                })
            }
        } else if (messageData.type === 'message') {
            const recipientTelegramIDString = String(messageData.recipient_telegram_id);
            const senderName = String(messageData.sender_name);
            const messageContent = String(messageData.message);
            const attachment = messageData.attachment;
            if (!recipientTelegramIDString || !senderName || !messageContent) {
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
        } else if (messageData.type === 'player_choice') {
            const sessionID = String(messageData.session_id);
            const playerChoice = String(messageData.player_choice);
            const playerTelegramID = String(messageData.player_telegram_id);

            if (!sessionID || !playerChoice || !playerTelegramID) {
                ws.send(JSON.stringify({ error: 'Invalid player choice format' }));
                return;
            };
            console.log(`Player ${playerTelegramID} from session ${sessionID} made a choice: ${playerChoice}`);
            const insertGameChoiceResult = insertGameChoice(db, sessionID, 1, playerTelegramID, playerChoice);
            console.log(`Insert game choice result: ${insertGameChoiceResult.success}, ${insertGameChoiceResult.status}. ${insertGameChoiceResult.message}`);
            
            const playersGameChoicesResult = getPlayersGameChoices(db, sessionID, 1);
            if (!playersGameChoicesResult.success) {
                console.error(`Error getting players game choices: ${playersGameChoicesResult.message}`);
                return;
            };

            if (
                playersGameChoicesResult &&
                playersGameChoicesResult.playersGameChoices &&
                playersGameChoicesResult.playersGameChoices.length > 0
            ) {
                const gameChoice = playersGameChoicesResult.playersGameChoices[0];
                const firstPlayerChoice = gameChoice.player1_choice;
                const secondPlayerChoice = gameChoice.player2_choice;
                const firstPlayerTelegramID = gameChoice.player1_telegram_id;
                const secondPlayerTelegramID = gameChoice.player2_telegram_id;

                console.log(`First player choice: ${firstPlayerChoice}. Second player choice: ${secondPlayerChoice}`);

                if (firstPlayerChoice !== null && secondPlayerChoice !== null) {
                    if (firstPlayerChoice === secondPlayerChoice) {
                        const rematchPayload = {
                            success: true,
                            type: 'game_rematch',
                            session_id: sessionID,
                        };

                        sendMessageToUser(users, gameSessionSubscriptions, firstPlayerTelegramID, rematchPayload);
                        sendMessageToUser(users, gameSessionSubscriptions, secondPlayerTelegramID, rematchPayload);

                        console.log(`Rematch triggered for session ${sessionID}`);
                        return;
                    };

                    const winningChoice = decideRandomWin(firstPlayerChoice, secondPlayerChoice);
                    console.log(`Winning choice: ${winningChoice}`);

                    const resultPayload = {
                        success: true,
                        type: 'game_result',
                        session_id: sessionID,
                        winner_telegram_id: winningChoice === firstPlayerChoice ? firstPlayerTelegramID : secondPlayerTelegramID,
                        looser_telegram_id: winningChoice === secondPlayerChoice ? firstPlayerTelegramID : secondPlayerTelegramID,
                    };

                    sendMessageToUser(users, gameSessionSubscriptions, firstPlayerTelegramID, resultPayload);
                    sendMessageToUser(users, gameSessionSubscriptions, secondPlayerTelegramID, resultPayload);
                } else {
                    console.log("Not all players have made their choices yet.");
                };
            };
        };
    } catch (error) {
        console.error(`Error parsing message: ${error}`);
        ws.send(JSON.stringify({ error: 'Failed to parse message' }));
    };
};


function handleDisconnection(users, gameSessionSubscriptions, telegramID, sessionID, service, code, reason) {
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
            console.log(`WebSocket closed for Telegram ID ${telegramID}. Code: ${code}, Reason: ${reason}`);
        } else if (service === 'runner') {
            console.log(`WebSocket closed for runner service. Code: ${code}, Reason: ${reason}`);
        };
    } catch (error) {
        console.error(`Error closing WebSocket for Telegram ID ${telegramID}: ${error}`);
    };
};


function sendMessageToUser (users, gameSessionSubscriptions, recipientTelegramIDString, message) {
    const user = users.get(recipientTelegramIDString);
    console.log(`Sending message to user ${recipientTelegramIDString}: ${JSON.stringify(message)}`);
    console.log(`Users map before sending message: ${JSON.stringify(Object.fromEntries(users))}`);
    console.log(
        `Game session subscriptions map before sending message: ${JSON.stringify(
            Object.fromEntries(
                Array.from(gameSessionSubscriptions, ([key, value]) => [key, Array.from(value)])
            )
        )}`
    );
    if (user && user.readyState === WebSocket.OPEN) {
        user.send(JSON.stringify(message));
    } else {
        console.error(`User with Telegram ID ${recipientTelegramIDString} is not connected.`);
    };
};
