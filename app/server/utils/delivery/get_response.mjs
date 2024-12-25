export function getResponse(db, deliveryID) {
    try {
        const getResponse = db.prepare(
            'SELECT * FROM deliveries_responses WHERE delivery_id = ?'
        );
        const getResponseResult = getResponse.all(deliveryID);
        return getResponseResult;
    } catch (error) {
        console.error('Error in getResponse:', error);
    };
};
