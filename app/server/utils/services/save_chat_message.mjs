import fs from 'fs';
import path from 'path';

export function saveChatMessage(
    bidID,
    customerTelegramID,
    performerTelegramID,
    customerName,
    performerName,
    message,
    attachment,
    senderType
) {
    try {
        const folderPath = path.join(process.cwd(), 'app', 'chats', 'services', String(bidID));
        fs.mkdirSync(folderPath, { recursive: true });

        const fileName = `${customerTelegramID}_${performerTelegramID}.txt`;
        const filePath = path.join(folderPath, fileName);

        const currentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
        const separator = '\n---\n';

        const formattedMessage = `${senderType === 'customer' ? `Заказчик ${customerName}` :
                                 `Исполнитель ${performerName}`}:\n\n` +
                                 `${attachment ? attachment : message}\n\n` +
                                 `${currentDate}${separator}`;

        fs.appendFileSync(filePath, formattedMessage, 'utf8');
    } catch (error) {
        console.error('Error in saveChatMessage saving chat message:', error);
    };
};