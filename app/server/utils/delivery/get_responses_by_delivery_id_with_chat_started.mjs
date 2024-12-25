export function getResponsesByDeliveryIDWithChatStarted(db, deliveryID) {
    try {
        const getResponsesByDeliveryIDWithChatStarted = db.prepare(
            'SELECT * FROM deliveries_responses WHERE delivery_id = ? AND chat_started = TRUE'
        );
        const getResponsesByDeliveryIDWithChatStartedResult = getResponsesByDeliveryIDWithChatStarted.all(deliveryID);
        return getResponsesByDeliveryIDWithChatStartedResult;
    } catch (error) {
        console.error('Error in getResponsesByDeliveryIDWithChatStarted:', error);
        return [];
    };
};
