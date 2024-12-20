export function updateResponse(
    db,
    deliveryID,
    courierTelegramID,
    chatStarted
) {
    try {
        const deliveryIDInt = parseInt(deliveryID, 10);
        const courierTelegramIDInt = BigInt(courierTelegramID);
        const chatStartedInt = chatStarted ? 1 : 0;

        const updateResponse = db.prepare(
            'UPDATE delivery_responses SET chat_started = ? WHERE delivery_id = ? AND courier_telegram_id = ?'
        );
        const updateResponseResult = updateResponse.run(chatStartedInt, deliveryIDInt, courierTelegramIDInt);
        return updateResponseResult;
    } catch (error) {
        console.error(`Error in updateResponse (delivery): ${error}`);
    };
};