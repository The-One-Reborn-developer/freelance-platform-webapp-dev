import fs from 'fs';
import path from "path";
import fetch from 'node-fetch';


export function sendAttachment(telegramID, filePath) {
    const URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`;
    
    const absoluteFilePath = encodeURI(path.resolve(filePath));
    console.log(`Absolute file path: ${absoluteFilePath}`);
    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append('chat_id', telegramID);
    formData.append('photo', fs.createReadStream(absoluteFilePath)); // Attach the file
    
    fetch(URL, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Attachment sent successfully:', data);
            } else {
                console.error('Error sending attachment:', data);
            };
        })
        .catch(error => {
            console.error('Error in sendAttachment:', error);
        });
};