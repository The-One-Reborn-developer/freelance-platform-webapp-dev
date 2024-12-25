export function getOpenBidsByCustomerTelegramID(db, customer_telegram_id) {
    try {
        const getBid = db.prepare(
            'SELECT * FROM bids WHERE customer_telegram_id = ? AND closed = FALSE'
        );
        const getBidResult = getBid.all(customer_telegram_id);
        return getBidResult;
    } catch (error) {
        console.error('Error in getOpenBidsByCustomerTelegramID:', error);
        return null;
    };
};
