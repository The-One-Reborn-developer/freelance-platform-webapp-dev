export function getNextGameSession(db) {
    const getNextGameSession = db.prepare(
        'SELECT * FROM game_sessions WHERE finished = FALSE ORDER BY session_date ASC LIMIT 1'
    );

    const getNextGameSessionResult = getNextGameSession.get();

    if (!getNextGameSessionResult) {
        return {
            success: false,
            status: 404,
            message: 'Следующая игровая сессия не найдена'
        };
    };

    return {
        success: true,
        status: 200,
        nextGameSession: getNextGameSessionResult
    };
};
