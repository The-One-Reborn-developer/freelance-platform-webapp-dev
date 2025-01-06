export function getPlayersGameChoices(
    db,
    sessionID,
    round
) {
    if (
        !sessionID ||
        !round
    ) {
        return {
            success: false,
            status: 400,
            message: 'Недостаточно данных для получения выборов игроков'
        };
    };

    sessionID = parseInt(sessionID, 10);
    round = parseInt(round, 10);

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
