export function getResponsesByPerformerTelegramIDWithChatStarted(db, performerTelegramID) {
    try {
        const getResponsesByPerformerTelegramIDWithChatStarted = db.prepare(
            'SELECT * FROM services_responses WHERE performer_telegram_id = ? AND chat_started = TRUE'
        );
        const getResponsesByPerformerTelegramIDWithChatStartedResult = getResponsesByPerformerTelegramIDWithChatStarted.all(performerTelegramID);
        return getResponsesByPerformerTelegramIDWithChatStartedResult;
    } catch (error) {
        console.error('Error in getRespondedCustomers:', error);
        return [];
    };
};