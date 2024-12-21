import fs from 'fs';
import fetch from 'node-fetch';


export function sendAttachment(telegramID, filePath) {
    const URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`;

    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append('chat_id', telegramID);
    formData.append('photo', fs.createReadStream(filePath)); // Attach the file
    console.log(`file path: ${filePath}, file exists: ${fs.existsSync(filePath)}`);
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