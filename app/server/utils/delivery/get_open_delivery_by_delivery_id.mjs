export function getOpenDeliveryByDeliveryID(db, deliveryID) {
    try {
        const getDelivery = db.prepare(
            'SELECT * FROM Deliverys WHERE id = ? AND closed = FALSE'
        );
        const getDeliveryResult = getDelivery.get(deliveryID);
        return getDeliveryResult;
    } catch (error) {
        console.error('Error in getDeliveryByDeliveryID:', error);
        return null;
    };
};