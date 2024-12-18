export function getResponsesByBidIDWithChatStarted(db, bidID) {
    try {
        const getResponsesByBidIDWithChatStarted = db.prepare(
            'SELECT * FROM responses WHERE bid_id = ? AND chat_started = TRUE'
        );
        const getResponsesByBidIDWithChatStartedResult = getResponsesByBidIDWithChatStarted.all(bidID);
        return getResponsesByBidIDWithChatStartedResult;
    } catch (error) {
        console.error('Error in getRespondedCustomers:', error);
        return [];
    };
};