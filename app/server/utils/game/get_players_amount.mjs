export function getPlayersAmount(db, sessionID) {
    const getPlayersAmountResult = db.prepare(
        'SELECT COUNT(*) as amount FROM session_players WHERE session_id = ?'
    ).get(sessionID);

    return {
        success: true,
        status: 200,
        playersAmount: getPlayersAmountResult.amount
    };
};
