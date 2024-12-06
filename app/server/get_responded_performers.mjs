export function getRespondedPerformers(db, customerTelegramID) {
    try {
        const getRespondedPerformers = db.prepare(
            'SELECT * FROM bids WHERE customer_telegram_id = ? AND closed = FALSE'
        );
        const getRespondedPerformersResult = getRespondedPerformers.all(customerTelegramID);
        return getRespondedPerformersResult;
    } catch (error) {
        console.error('Error in get_responded_performers:', error);
    };
};