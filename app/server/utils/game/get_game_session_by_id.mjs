export function getGameSessionByID(
    db,
    sessionID
) {
    const getGameSessionByIDResult = db.prepare(
        'SELECT * FROM game_sessions WHERE id = ?'
    ).get(sessionID);

    if (!getGameSessionByIDResult) {
        return {
            success: false,
            status: 404,
            message: 'Игровая сессия не найдена'
        };
    };

    return {
        success: true,
        status: 200,
        gameSession: getGameSessionByIDResult
    };
};
