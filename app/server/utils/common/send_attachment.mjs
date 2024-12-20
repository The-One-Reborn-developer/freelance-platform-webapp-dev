import fs from 'fs';
import fetch from 'node-fetch';

export function sendAttachment(telegramID, filePath) {
    const URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`;

    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append('chat_id', telegramID);
    formData.append('document', fs.createReadStream(filePath)); // Attach the file

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