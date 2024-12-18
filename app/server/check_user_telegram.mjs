export function checkUserTelegram(db, telegramID, service) {
    try {
        const checkUserTelegram = db.prepare(
            'SELECT COUNT(*) as count FROM users WHERE telegram_id = ? AND service = ?'
        );
        const checkUserTelegramResult = checkUserTelegram.get(telegramID, service);
        return checkUserTelegramResult;
    } catch (error) {
        console.error('Error in checkUserTelegram:', error);
    };
};