export function getOpenDeliveryByDeliveryID(db, deliveryID) {
    try {
        const getDelivery = db.prepare(
            'SELECT * FROM deliveries WHERE id = ? AND closed = FALSE'
        );
        const getDeliveryResult = getDelivery.get(deliveryID);
        return getDeliveryResult;
    } catch (error) {
        console.error('Error in getOpenDeliveryByDeliveryID:', error);
        return null;
    };
};
