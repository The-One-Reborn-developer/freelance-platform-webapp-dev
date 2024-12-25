import fs from 'fs';
import path from 'path';


export function getChatMessages(deliveryID, customerTelegramID, courierTelegramID) {
    const chatFilePath = path.join(process.cwd(), 'app', 'chats', 'delivery', String(deliveryID), `${customerTelegramID}_${courierTelegramID}.txt`);
    
    try {
        if (fs.existsSync(chatFilePath)) {
            const chatContent = fs.readFileSync(chatFilePath, 'utf8');
            const chatMessages = chatContent.split('\n---\n');
            return chatMessages;
        } else {
            return [];
        };
    } catch (error) {
        console.error('Error in getChatMessages reading chat file:', error);
        return [];
    };
};
