export function updateProfileInfo(db, telegramID, rate, experience) {
    try {
        const updateProfileInfo = db.prepare(
            'UPDATE users SET rate = ?, experience = ? WHERE telegram_id = ?'
        );
        const updateProfileInfoResult = updateProfileInfo.run(rate, experience, telegramID);
        return updateProfileInfoResult;
    } catch (error) {
        console.error('Error in changeProfileInfo:', error);
    };
};