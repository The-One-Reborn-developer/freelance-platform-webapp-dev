export function getNextGameSessionDate(db) {
    const getNextGameSessionDate = db.prepare(
        'SELECT session_date FROM game_sessions WHERE finished = FALSE'
    );

    const getNextGameSessionDateResult = getNextGameSessionDate.get();

    if (!getNextGameSessionDateResult) {
        return {
            success: false,
            status: 404,
            message: 'Следующая игровая сессия не найдена'
        };
    };

    return {
        success: true,
        status: 200,
        nextGameSessionDate: getNextGameSessionDateResult.session_date
    };
};
