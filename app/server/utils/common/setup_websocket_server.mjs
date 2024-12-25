import { WebSocketServer } from "ws";


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
                console.log(`WebSocket connection established for Telegram ID: ${telegramID}`);
            };
        };

        // Handle incoming messages
        ws.on('message', (rawMessage) => {
            try {
                const { 
                    recipient_telegram_id: recipientTelegramID,
                    sender_name: senderName,
                    message,
                    attachment
                } = JSON.parse(rawMessage);
                const recipientTelegramIDString = String(recipientTelegramID);

                if (!recipientTelegramID || !String(senderName).trim() || !String(message).trim()) {
                    ws.send(JSON.stringify({ error: 'Invalid message format' }));
                    return;
                } else {
                    sendMessageToUser(
                        recipientTelegramIDString,
                        {
                            sender_telegram_id: telegramID,
                            sender_name: senderName,
                            message,
                            attachment
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
