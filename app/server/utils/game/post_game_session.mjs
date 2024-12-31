export function postGameSession(db, sessionID) {
    if (!sessionID) {
        console.error('Session ID not provided');
        return {
            success: false,
            status: 400,
            message: 'Session ID not provided'
        }
    };

    const existingGameSession = db.prepare(
        'SELECT * FROM game_sessions WHERE session_id = ?'
    ).get(sessionID);

    if (existingGameSession) {
        return {
            success: false,
            status: 409,
            message: `Сессия с ID ${sessionID} уже существует`
        }
    };

    const postGameSession = db.prepare(
        'INSERT INTO game_sessions (session_id) VALUES (?)'
    );
    const postGameSessionResult = postGameSession.run(sessionID);
    
    const newGameSessionID = postGameSessionResult.lastInsertRowid;
    return {
        success: true,
        status: 201,
        message: `Сессия с ID ${newGameSessionID} успешно создана`
    };
};
