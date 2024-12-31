export function postPlayer(
    db,
    playerTelegramID
) {
    // TODO: make session_id dynamic
    try {
        const existingPlayer = db.prepare(
            'SELECT * FROM session_players WHERE player_telegram_id = ?'
        ).get(playerTelegramID);
        console.log(existingPlayer);
        if (existingPlayer) {
            return 'Player already exists';
        };

        const postPlayer = db.prepare(
            `INSERT INTO session_players (session_id,
                                          player_telegram_id) VALUES (1, ?)
        `);

        const postPlayerResult = postPlayer.run(
            playerTelegramID
        );
        console.log(postPlayerResult);
        const newPlayerID = postPlayerResult.lastInsertRowid;
        return newPlayerID;
    } catch (error) {
        console.error('Error in postPlayer:', error);
        return false;
    };
};
