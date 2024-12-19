export function updateResponse(
    db,
    bidID,
    performerTelegramID,
    chatStarted) {
    try {
        const bidIDInt = parseInt(bidID, 10);
        const performerTelegramIDInt = BigInt(performerTelegramID);
        const chatStartedInt = chatStarted ? 1 : 0;

        const updateResponse = db.prepare(
            'UPDATE services_responses SET chat_started = ? WHERE bid_id = ? AND performer_telegram_id = ?'
        );
        const updateResponseResult = updateResponse.run(chatStartedInt, bidIDInt, performerTelegramIDInt);
        return updateResponseResult;
    } catch (error) {
        console.error(`Error in updateResponse: ${error}`);
    };
};