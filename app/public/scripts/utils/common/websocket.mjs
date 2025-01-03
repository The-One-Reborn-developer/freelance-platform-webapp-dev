import { scrollToBottom } from '../../modules/common_index.mjs';


let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 5000; // 5 seconds


export function initializeWebSocket(validatedTelegramID, service, sessionID) {
    if (!validatedTelegramID) {
        console.error('Telegram ID not found, unable to initialize WebSocket');
        return;
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Maximum reconnect attempts reached, unable to initialize WebSocket');
        return;        
    } else {
        const socket = new WebSocket(constructWebSocketURL(validatedTelegramID, service, sessionID));

        socket.addEventListener('open', () => {
            console.log(`WebSocket connection established for Telegram ID: ${validatedTelegramID}. Service: ${service}. Session ID: ${sessionID}`);
            reconnectAttempts = 0;
        });

        socket.addEventListener('close', () => {
            console.log(`WebSocket connection closed for Telegram ID: ${validatedTelegramID}. Reconnecting...`);
            reconnectAttempts++;
            const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts - 1); // Exponential backoff
            setTimeout(() => initializeWebSocket(validatedTelegramID, service, sessionID), Math.min(delay, 60000)); // Limit to 1 minute
        });

        socket.addEventListener('error', (error) => {
            console.error(`WebSocket error for Telegram ID ${validatedTelegramID}: ${error}`);
        });

        socket.addEventListener('message', (event) => {
            console.log(`Received message from Telegram ID ${validatedTelegramID}: ${event.data}`);

            try {
                const messageData = JSON.parse(event.data);

                switch (messageData.type) {
                    case 'timer_update':
                        handleTimerUpdate(messageData);
                        break;
                    case 'message_update':
                        handleMessageUpdate(messageData);
                        break;
                    default:
                        console.warn(`Unknown message type: ${messageData.type}`);
                        break;
                };
            } catch (error) {
                console.error(`Error parsing message data: ${error}`);
            };
        });

        return socket;
    };
};


function constructWebSocketURL(telegramID, service, sessionID) {
    const queryParameters = new URLSearchParams({
        'telegram_id': telegramID,
        'service': service,
    });

    if (service === 'game') {
        queryParameters.append('session_id', sessionID);
    };

    return `wss://${window.location.host}?${queryParameters.toString()}`;
};


function handleTimerUpdate(messageData) {
    let timerElement = document.getElementById('game-data-timer');

    if (!timerElement) {
        console.warn('Timer element not found, creating a new one');
        timerElement = document.createElement('div');
        timerElement.id = 'game-data-timer';
        timerElement.className = 'game-data-timer';
        document.getElementById('display').appendChild(timerElement);
    };

    const { hours, minutes, seconds } = formatRemainingTime(messageData.remaining_time);

    switch (messageData.status) {
        case 'pending':
            timerElement.textContent = `До следующего игрового сеанса: ${hours} ч. ${minutes} мин. ${seconds} с.`;
            break;
        case 'ongoing':
            timerElement.textContent = `Игра начинается через ${minutes} мин. ${seconds} с.`;
            break;
        case 'finished':
            timerElement.textContent = 'Игра окончена';
            break;
    };
};


function formatRemainingTime(remainingTime) {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = Math.floor(remainingTime % 60);

    return {
        hours,
        minutes,
        seconds
    };
};


function handleMessageUpdate(messageData) {
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
                                    <br><br><img src="${normalizedData.attachment}" alt="Файл" class="attachment-image">
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
};
