export function getUser(db, telegram_id) {
    try {
        const getUser = db.prepare(
            'SELECT * FROM users WHERE telegram_id = ?'
        );
        const getUserResult = getUser.get(telegram_id);
        return getUserResult;
    } catch (error) {
        console.error('Error in getUser:', error);
        return null;
    };
};