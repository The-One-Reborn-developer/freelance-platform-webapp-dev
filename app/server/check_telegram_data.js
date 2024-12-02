import crypto from "crypto";


export function checkTelegramData(req, res) {
    try {
        const { role, name, rate, experience } = req.body;
        const telegram_data = req.body.telegram_data;

        if (typeof telegram_data !== 'string' || !telegram_data) {
            res.status(400).json({ message: 'Телеграм-данные не в корректном формате.' });
            return;
        };

        // Decode and parse user data
        const userDataString = new URLSearchParams(telegram_data).get('user');
        const userData = JSON.parse(decodeURIComponent(userDataString));
        const telegram_id = userData.id;

        // Check environment variable
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN is not set.');
            res.status(500).json({ message: 'Server configuration error.' });
            return;
        };

        // Compute secret key
        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();

        // Create data check string
        const dataCheckString = telegram_data.split('&')
            .filter(pair => pair.split('=')[0] !== 'hash') // Exclude hash
            .sort()
            .map(pair => pair.split('=')[0] + '=' + decodeURIComponent(pair.split('=')[1]))
            .join('\n'); // Format as key=value\n

        // Compute hash
        const computedHash = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Compare hashes
        const receivedHash = new URLSearchParams(telegram_data).get('hash');
        if (computedHash !== receivedHash) {
            res.status(400).json({ message: 'Неверные телеграм-данные.' });
            return;
        };

        // Check timestamp
        const authDate = parseInt(new URLSearchParams(telegram_data).get('auth_date'), 10);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) { // 24 hours
            res.status(400).json({ message: 'Телеграм-данные устарели.' });
            return;
        };

        return { telegram_id, role, name, rate, experience };
    } catch (error) {
        console.error('Error in checkTelegramData:', error);
        res.status(400).json({ message: 'Ошибка обработки телеграм-данных.' });
        return;
    };
};