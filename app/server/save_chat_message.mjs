import fs from 'fs';
import path from 'path';

export function saveChatMessage(
    bidID,
    customerTelegramID,
    performerTelegramID,
    customerName,
    performerName,
    message,
    senderType) {
    try {
        const folderPath = path.join(process.cwd(), 'app', 'chats', String(bidID));
        fs.mkdirSync(folderPath, { recursive: true });

        const fileName = `${customerTelegramID}_${performerTelegramID}.txt`;
        const filePath = path.join(folderPath, fileName);

        const currentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
        const separator = '\n---\n';

        const formattedMessage = `${senderType === 'customer' ? `Заказчик ${customerName}` :
                                 `Мастер ${performerName}`}:\n${message}\n${currentDate}${separator}`;

        fs.appendFileSync(filePath, formattedMessage, 'utf8');
    } catch (error) {
        console.error('Error saving chat message:', error);
    };
};