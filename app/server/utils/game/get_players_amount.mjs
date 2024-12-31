export function getPlayersAmount(db) {
    try {
        const getPlayersAmount = db.prepare(
            'SELECT COUNT(*) as amount FROM session_players WHERE session_id = 1'
        )

        const getPlayersAmountResult = getPlayersAmount.get();

        return getPlayersAmountResult.amount;
    } catch (error) {
        console.error('Error in getPlayersAmount:', error);
        return false;
    };
};
