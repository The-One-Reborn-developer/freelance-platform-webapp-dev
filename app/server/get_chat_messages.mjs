import fs from 'fs';
import path from 'path';


export function getChatMessages(bidID, customerTelegramID, performerTelegramID) {
    const chatFilePath = path.join(process.cwd(), 'app', 'chats', String(bidID), `${customerTelegramID}_${performerTelegramID}.txt`);
    
    try {
        if (fs.existsSync(chatFilePath)) {
            const chatContent = fs.readFileSync(chatFilePath, 'utf8');
            const chatMessages = chatContent.split('\n---\n');
            return chatMessages;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error reading chat file:', error);
        return [];
    };
};