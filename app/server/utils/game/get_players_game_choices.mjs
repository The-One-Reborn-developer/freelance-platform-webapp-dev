export function getPlayersGameChoices(
    db,
    sessionID,
    round
) {
    const getPlayersGameChoiceResult = db.prepare(
        'SELECT * FROM game_pairs WHERE session_id = ? AND round = ?'
    ).all(sessionID, round);

    if (!getPlayersGameChoiceResult) {
        return {
            success: false,
            status: 404,
            message: 'Выборы игроков не найдены'
        };
    };

    return {
        success: true,
        status: 200,
        playersGameChoices: getPlayersGameChoiceResult
    };
};
