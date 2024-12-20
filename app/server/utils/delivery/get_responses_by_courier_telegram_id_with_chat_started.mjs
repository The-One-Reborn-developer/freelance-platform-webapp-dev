export function getResponsesByCourierTelegramIDWithChatStarted(db, courierTelegramID) {
    try {
        const getResponsesByCourierTelegramIDWithChatStarted = db.prepare(
            'SELECT * FROM delivery_responses WHERE courier_telegram_id = ? AND chat_started = TRUE'
        );
        const getResponsesByCourierTelegramIDWithChatStartedResult = getResponsesByCourierTelegramIDWithChatStarted.all(courierTelegramID);
        return getResponsesByCourierTelegramIDWithChatStartedResult;
    } catch (error) {
        console.error(`Error in getResponsesByCourierTelegramIDWithChatStarted (delivery): ${error}`);
        return [];
    };
};