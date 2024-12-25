export function getResponsesByBidIDWithChatStarted(db, bidID) {
    try {
        const getResponsesByBidIDWithChatStarted = db.prepare(
            'SELECT * FROM services_responses WHERE bid_id = ? AND chat_started = TRUE'
        );
        const getResponsesByBidIDWithChatStartedResult = getResponsesByBidIDWithChatStarted.all(bidID);
        return getResponsesByBidIDWithChatStartedResult;
    } catch (error) {
        console.error('Error in getResponsesByBidIDWithChatStarted:', error);
        return [];
    };
};
