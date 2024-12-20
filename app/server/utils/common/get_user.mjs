export function getUser(db, telegramID) {
    try {
        const getUser = db.prepare(
            'SELECT * FROM users WHERE telegram_id = ?'
        );
        const getUserResult = getUser.get(telegramID);
        return getUserResult;
    } catch (error) {
        console.error('Error in getUser:', error);
        return null;
    };
};