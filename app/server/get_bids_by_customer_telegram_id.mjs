export function getBidsByCustomerTelegramID(db, customer_telegram_id) {
    try {
        const getBid = db.prepare(
            'SELECT * FROM bids WHERE customer_telegram_id = ? AND closed = FALSE'
        );
        const getBidResult = getBid.get(customer_telegram_id);
        return getBidResult;
    } catch (error) {
        console.error('Error in getUser:', error);
        return null;
    };
};