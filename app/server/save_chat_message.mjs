import fs from 'fs';
import path from 'path';

export function saveChatMessage(
    bidID,
    customerTelegramID,
    performerTelegramID,
    customerFullName,
    performerFullName,
    message,
    senderType) {
    try {
        const folderPath = path.join(process.cwd(), 'app', 'app', 'chats', String(bidID));
        fs.mkdirSync(folderPath, { recursive: true });

        const fileName = `${customerTelegramID}_${performerTelegramID}.txt`;
        const filePath = path.join(folderPath, fileName);

        const currentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
        const separator = '\n---\n';

        let formattedMessage = '';

        if (senderType === 'customer') {
            formattedMessage = `Заказчик ${customerFullName}:\n${message}\n${currentDate}${separator}`;
        } else if (senderType === 'performer') {
            formattedMessage = `Мастер ${performerFullName}:\n${message}\n${currentDate}${separator}`;
        } else {
            throw new Error('Invalid senderType. Must be "customer" or "performer".');
        }

        fs.appendFileSync(filePath, formattedMessage, 'utf8');
        console.log(`Message saved to ${filePath}`);
    } catch (error) {
        console.error('Error saving chat message:', error);
    };
};