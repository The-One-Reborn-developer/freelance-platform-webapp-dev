import { scrollToBottom } from './scrolls.mjs';


export function initializeWebSocket(validatedTelegramID) {
    if (!validatedTelegramID) {
        console.error('Telegram ID not found, unable to initialize WebSocket');
        return;
    } else {
        const socket = new WebSocket(`wss://${window.location.host}?telegramID=${validatedTelegramID}`);

        socket.addEventListener('open', () => {
            console.log(`WebSocket connection established for Telegram ID: ${validatedTelegramID}`);
        });

        socket.addEventListener('close', () => {
            console.log(`WebSocket connection closed for Telegram ID: ${validatedTelegramID}. Reconnecting...`);
            setTimeout(() => initializeWebSocket(validatedTelegramID), 5000); // Reconnect after 5 seconds
        });

        socket.addEventListener('error', (error) => {
            console.error(`WebSocket error for Telegram ID ${validatedTelegramID}: ${error}`);
        });

        socket.addEventListener('message', (event) => {
            console.log(`Received message from Telegram ID ${validatedTelegramID}: ${event.data}`);

            try {
                const messageData = JSON.parse(event.data);

                const normalizedData = {
                    senderTelegramID: messageData.sender_telegram_id,
                    senderName: messageData.sender_name,
                    message: messageData.message,
                    attachment: messageData.attachment
                }

                if (!normalizedData.senderName || !normalizedData.message) {
                    console.error('Invalid message data received');
                    return;
                } else if (
                    !messageData ||
                    typeof messageData.sender_name !== 'string' ||
                    typeof messageData.message !== 'string' ||
                    messageData.sender_name.trim() === '' ||
                    messageData.message.trim() === ''
                ) {
                    console.error('Invalid message data received');
                    return;
                };

                console.log(`Valid message received from ${messageData.sender_name.trim()}: ${messageData.message.trim()}`);

                const chatHistory = document.getElementById('chat-history');
                if (normalizedData.attachment) {
                    chatHistory.innerHTML += `<div class="chat-message">
                                                ${normalizedData.senderName}
                                                <br><br><img src="${normalizedData.attachment}" alt="Attachment">
                                                <br><br>${new Date().toLocaleString('ru-RU', { timezone: 'Europe/Moscow' })}
                                              </div>`;
                } else {
                    chatHistory.innerHTML += `<div class="chat-message">
                                                ${normalizedData.senderName}
                                                <br><br>${normalizedData.message}
                                                <br><br>${new Date().toLocaleString('ru-RU', { timezone: 'Europe/Moscow' })}
                                              </div>`;
                };

                const display = document.getElementById('display');
                scrollToBottom(display);
            } catch (error) {
                console.error(`Error parsing message data: ${error}`);
            };
        });

        return socket;
    };
};