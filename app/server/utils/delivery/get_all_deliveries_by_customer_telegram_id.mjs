export function getAllDeliveriesByCustomerTelegramID(db, customerTelegramID) {
    try {
        const getDelivery = db.prepare(
            'SELECT * FROM deliveries WHERE customer_telegram_id = ?'
        );
        const getDeliveryResult = getDelivery.all(customerTelegramID);
        return getDeliveryResult;
    } catch (error) {
        console.error('Error in getAllDeliveriesByCustomerTelegramID:', error);
        return null;
    };
};
