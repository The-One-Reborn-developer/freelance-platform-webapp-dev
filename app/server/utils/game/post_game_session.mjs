export function postGameSession(db, sessionDate) {
    if (!sessionDate) {
        return {
            success: false,
            status: 400,
            message: 'Дата игровой сессии не предоставлена'
        };
    };

    const existingGameSession = db.prepare(
        'SELECT * FROM game_sessions WHERE session_date = ?'
    ).get(sessionDate);

    if (existingGameSession) {
        return {
            success: false,
            status: 409,
            message: `Игровая сессия с датой ${sessionDate} уже существует`
        }
    };

    const postGameSession = db.prepare(
        'INSERT INTO game_sessions (session_date) VALUES (?)'
    );
    const postGameSessionResult = postGameSession.run(sessionDate);
    
    const newGameSessionID = postGameSessionResult.lastInsertRowid;
    return {
        success: true,
        status: 201,
        message: `Сессия с ID ${newGameSessionID} успешно создана`
    };
};
