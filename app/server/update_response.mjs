export function updateResponse(
    db,
    bidID,
    performerTelegramID,
    chatStarted) {
    try {
        const updateResponse = db.prepare(
            'UPDATE responses SET chat_started = ? WHERE bid_id = ? AND performer_telegram_id = ?'
        );
        const updateResponseResult = updateResponse.run(chatStarted, bidID, performerTelegramID);
        return updateResponseResult;
    } catch (error) {
        console.error(`Error in updateResponse: ${error}`);
    };
};