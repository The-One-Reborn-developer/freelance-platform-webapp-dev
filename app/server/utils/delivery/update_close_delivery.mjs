export function updateCloseDelivery(db, deliveryID) {
    try {
        const closeDelivery = db.prepare(
            'UPDATE deliveries SET closed = TRUE WHERE id = ?'
        );
        const closeDeliveryResult = closeDelivery.run(deliveryID);
        return closeDeliveryResult;
    } catch (error) {
        console.error('Error in updateCloseDelivery:', error);
    };
};
