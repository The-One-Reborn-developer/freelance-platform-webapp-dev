import fs from 'fs';
import path from 'path';

export function saveChatMessage(
    deliveryID,
    customerTelegramID,
    courierTelegramID,
    customerName,
    courierName,
    message,
    attachment,
    senderType
) {
    try {
        const folderPath = path.join(process.cwd(), 'app', 'delivery', 'chats', String(bidID));
        fs.mkdirSync(folderPath, { recursive: true });

        const fileName = `${customerTelegramID}_${courierTelegramID}.txt`;
        const filePath = path.join(folderPath, fileName);

        const currentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
        const separator = '\n---\n';

        const formattedMessage = `${senderType === 'customer' ? `Заказчик ${customerName}` :
                                 `Курьер ${courierName}`}:\n\n` +
                                 `${attachment ? attachment : message}\n\n` +
                                 `${currentDate}${separator}`;

            fs.appendFileSync(filePath, formattedMessage, 'utf8');
    } catch (error) {
        console.error('Error in saveChatMessage saving chat message:', error);
    };
};