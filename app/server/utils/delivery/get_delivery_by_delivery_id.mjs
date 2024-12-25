export function getDeliveryByDeliveryID(db, deliveryID) {
    try {
        const getDelivery = db.prepare(
            'SELECT * FROM deliveries WHERE id = ?'
        );
        const getDeliveryResult = getDelivery.get(deliveryID);
        return getDeliveryResult;
    } catch (error) {
        console.error('Error in getDeliveryByDeliveryID:', error);
        return null;
    };
};
