export function checkUserTelegram(db, telegramID) {
    try {
        const checkUserTelegram = db.prepare(
            'SELECT COUNT(*) as count FROM users WHERE telegram_id = ?'
        );
        const checkUserTelegramResult = checkUserTelegram.get(telegramID);
        return checkUserTelegramResult;
    } catch (error) {
        console.error('Error in checkUserTelegram:', error);
    };
};