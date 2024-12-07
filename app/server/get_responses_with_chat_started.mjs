export function getResponsesWithChatStarted(db, performerTelegramID) {
    try {
        const getResponsesWithChatStarted = db.prepare(
            'SELECT * FROM responses WHERE performer_telegram_id = ? AND chat_started = TRUE'
        );
        const getResponsesWithChatStartedResult = getResponsesWithChatStarted.all(performerTelegramID);
        return getResponsesWithChatStartedResult;
    } catch (error) {
        console.error('Error in getRespondedCustomers:', error);
        return [];
    };
};