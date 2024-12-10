import {
    WebSocketServer,
    WebSocket } from "ws";


export function setupWebsocketServer(server) {
    const wss = new WebSocketServer({ server });

    const users = new Map();

    wss.on('connection', (ws, req) => {
        const params = new URLSearchParams(req.url.split('?')[1]);
        const telegramID = String(params.get('telegramID'));

        if (!telegramID) {
            ws.close(1008, 'Missing Telegram ID');
            return;
        } else {
            if (users.has(telegramID)) {
                console.warn(`Duplicate connection for Telegram ID: ${telegramID}. Closing the old connection.`);
                users.get(telegramID).close(); // Close the previous connection
            } else {
                users.set(telegramID, ws);
                users.get(telegramID).send(JSON.stringify({ status: 'connected' }));
                console.log(`WebSocket connection established for Telegram ID: ${telegramID}`);
            };
        };

        // Handle incoming messages
        ws.on('message', (rawMessage) => {
            console.log(`Received message from Telegram ID ${telegramID}: ${rawMessage}`);

            try {
                const { 
                    recipient_telegram_id: recipientTelegramID,
                    sender_name: senderName,
                    message
                } = JSON.parse(rawMessage);
                const recipientTelegramIDString = String(recipientTelegramID);

                if (!recipientTelegramID || !String(senderName).trim() || !String(message).trim()) {
                    console.error(`Invalid message from Telegram ID ${telegramID}: ${rawMessage}`);
                    ws.send(JSON.stringify({ error: 'Invalid message format' }));
                    return;
                } else {
                    console.log(`Parsed values - recipientTelegramID: ${recipientTelegramID}, senderName: ${senderName}, message: ${message}`);

                    sendMessageToUser(
                        recipientTelegramIDString,
                        {
                            sender_telegram_id: telegramID,
                            sender_name: senderName,
                            message 
                        }
                    );
                };
            } catch (error) {
                console.error(`Error parsing message from Telegram ID ${telegramID}: ${error}`);
                ws.send(JSON.stringify({ error: 'Failed to parse message' }));
            };
        });

        // Handle disconnections
        ws.on('close', (code, reason) => {
            users.delete(telegramID);
            console.log(`WebSocket closed for Telegram ID ${telegramID}. Code: ${code}, Reason: ${reason}`);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`WebSocket error for Telegram ID ${telegramID}: ${error.message}`);
        });
    });

    // Send message to a specific user
    function sendMessageToUser (recipientTelegramID, message) {
        const user = users.get(recipientTelegramID);
        console.log(`Current users keys: ${Array.from(users.keys())}`);
        // Check type of mapped keys
        console.log(`Type of user: ${typeof user}`);

        if (user) {
            user.send(JSON.stringify(message));
        } else {
            console.error(`User with Telegram ID ${recipientTelegramID} is not connected.`);
        };
    };

    return { sendMessageToUser };
};