import { scrollToBottom } from "../common/scrolls.mjs";


export function handleMessageUpdate(messageData) {
    const normalizedData = {
        senderTelegramID: messageData.sender_telegram_id,
        senderName: messageData.sender_name,
        message: messageData.message,
        attachment: messageData.attachment
    };

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
