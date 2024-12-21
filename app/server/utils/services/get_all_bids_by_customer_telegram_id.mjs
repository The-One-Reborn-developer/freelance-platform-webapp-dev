export function getAllBidsByCustomerTelegramID(db, customerTelegramID) {
    try {
        const getBid = db.prepare(
            'SELECT * FROM bids WHERE customer_telegram_id = ?'
        );
        const getBidResult = getBid.all(customerTelegramID);
        return getBidResult;
    } catch (error) {
        console.error('Error in getAllBidsByCustomerTelegramID:', error);
        return null;
    };
};