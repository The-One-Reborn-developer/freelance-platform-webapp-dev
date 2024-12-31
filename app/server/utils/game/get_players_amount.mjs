export function getPlayersAmount(db) {
    const getPlayersAmount = db.prepare(
        'SELECT COUNT(*) as amount FROM session_players WHERE session_id = 1'
    );

    const getPlayersAmountResult = getPlayersAmount.get();

    return {
        success: true,
        status: 200,
        playersAmount: getPlayersAmountResult.amount
    };
};
