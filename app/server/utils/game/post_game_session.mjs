export function postGameSession(db, sessionID) {
    try {
        if (!sessionID) {
            console.error('Session ID not provided');
            return false;
        };

        const existingGameSession = db.prepare(
            'SELECT * FROM game_sessions WHERE session_id = ?'
        ).get(sessionID);

        if (existingGameSession) {
            return 'Game session already exists';
        };

        const postGameSession = db.prepare(
            'INSERT INTO game_sessions (session_id) VALUES (?)'
        );
        const postGameSessionResult = postGameSession.run(sessionID);
        
        return postGameSessionResult;
    } catch (error) {
        console.error('Error in postGameSession:', error);
    };
};
