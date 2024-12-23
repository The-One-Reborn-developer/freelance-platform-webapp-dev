export function getAllOpenBidsByCustomerTelegramID(db, customerTelegramID) {
    try {
        const getBid = db.prepare(
            'SELECT * FROM bids WHERE customer_telegram_id = ? AND closed = FALSE'
        );
        const getBidResult = getBid.all(customerTelegramID);
        return getBidResult;
    } catch (error) {
        console.error('Error in getAllOpenBidsByCustomerTelegramID:', error);
        return null;
    };
};