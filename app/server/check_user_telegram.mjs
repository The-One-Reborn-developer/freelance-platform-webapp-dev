export function checkUserTelegram(db, telegramID, service) {
    try {
        if (service === 'services') {
            const checkUserTelegram = db.prepare(
                'SELECT COUNT(*) as count FROM users WHERE telegram_id = ? AND registered_in_services = 1'
            );
            const checkUserTelegramResult = checkUserTelegram.get(telegramID, service);
            return checkUserTelegramResult;   
        } else if (service === 'deliveries') {
            const checkUserTelegram = db.prepare(
                'SELECT COUNT(*) as count FROM users WHERE telegram_id = ? AND registered_in_deliveries = 1'
            );
            const checkUserTelegramResult = checkUserTelegram.get(telegramID, service);
            return checkUserTelegramResult;
        }
    } catch (error) {
        console.error('Error in checkUserTelegram:', error);
    };
};