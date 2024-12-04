export function getBidsByCustomerTelegramID(db, telegram_id) {
    try {
        const getBid = db.prepare(
            'SELECT * FROM bids WHERE telegram_id = ? AND closed = FALSE'
        );
        const getBidResult = getBid.get(telegram_id);
        return getBidResult;
    } catch (error) {
        console.error('Error in getUser:', error);
        return null;
    };
};