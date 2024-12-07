export function updateResponse(
    db,
    bidID,
    performerTelegramID,
    chatStarted) {
    try {
        const chatStartedInt = chatStarted ? 1 : 0;

        const updateResponse = db.prepare(
            'UPDATE responses SET chat_started = ? WHERE bid_id = ? AND performer_telegram_id = ?'
        );
        const updateResponseResult = updateResponse.run(chatStartedInt, bidID, performerTelegramID);
        return updateResponseResult;
    } catch (error) {
        console.error(`Error in updateResponse: ${error}`);
    };
};