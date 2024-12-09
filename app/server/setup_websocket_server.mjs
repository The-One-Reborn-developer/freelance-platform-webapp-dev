import {
    WebSocketServer,
    WebSocket } from "ws";


export function setupWebsocketServer(server) {
    const wss = new WebSocketServer({ server });

    const users = new Map();

    wss.on('connection', (ws, req) => {
        const params = new URLSearchParams(req.url.split('?')[1]);
        const telegramID = params.get('telegramID');

        if (!telegramID) {
            ws.close(1008, 'Missing Telegram ID');
            return;
        };

        users.set(telegramID, ws);
        console.log(`WebSocket connection established for Telegram ID: ${telegramID}`);

        // Handle incoming messages
        ws.on('message', (rawMessage) => {
            console.log(`Received message from Telegram ID ${telegramID}: ${rawMessage}`);

            try {
                const { recipientTelegramID, senderName, message } = JSON.parse(rawMessage);

                if (!recipientTelegramID || !senderName || !message) {
                    console.error(`Invalid message from Telegram ID ${telegramID}: ${rawMessage}`);
                    ws.send(JSON.stringify({ error: 'Invalid message format' }));
                    return;
                } else {
                    sendMessageToUser(
                        recipientTelegramID,
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
        ws.on('close', () => {
            users.delete(telegramID);
            console.log(`WebSocket connection closed for Telegram ID: ${telegramID}`);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`WebSocket error for Telegram ID ${telegramID}: ${error.message}`);
        });
    });

    // Send message to a specific user
    const sendMessageToUser = (telegramID, message) => {
        const user = users.get(telegramID);
        if (user) {
            user.send(JSON.stringify(message));
        };
    };

    return { sendMessageToUser };
};