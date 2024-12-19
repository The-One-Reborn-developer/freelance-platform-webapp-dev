export function getOpenDeliveriesByCustomerTelegramID(db, customer_telegram_id) {
    try {
        const getDelivery = db.prepare(
            'SELECT * FROM deliveries WHERE customer_telegram_id = ? AND closed = FALSE'
        );
        const getDeliveryResult = getDelivery.all(customer_telegram_id);
        return getDeliveryResult;
    } catch (error) {
        console.error('Error in getOpenDeliveriesByCustomerTelegramID:', error);
        return null;
    };
};