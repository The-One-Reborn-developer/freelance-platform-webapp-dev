export function getGameSessionAd(
    db,
    sessionID
) {
    const getGameSessionAdResult = db.prepare(
        'SELECT * FROM game_session_ad WHERE id = ?'
    ).get(sessionID);

    if (!getGameSessionAdResult) {
        return {
            success: false,
            message: 'Ad not found'
        };
    };
    
    return {
        success: true,
        message: `Ad for session ${sessionID} found`,
        ad: getGameSessionAdResult
    };
};
