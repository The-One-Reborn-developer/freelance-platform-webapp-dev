export function checkUserTelegram(db, telegram_id) {
    try {
        const checkUserTelegram = db.prepare(
            'SELECT COUNT(*) as count FROM users WHERE telegram_id = ?'
        );
        const checkUserTelegramResult = checkUserTelegram.get(telegram_id);
        return checkUserTelegramResult;
    } catch (error) {
        console.error('Error in checkUserTelegram:', error);
    };
};