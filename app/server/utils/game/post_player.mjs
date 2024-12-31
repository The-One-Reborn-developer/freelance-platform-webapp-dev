export function postPlayer(
    db,
    playerTelegramID,
    playerName
) {
    if (!playerTelegramID) {
        console.error('Player Telegram ID not provided');
        return false;
    };
    // TODO: make session_id dynamic
    try {
        const existingPlayer = db.prepare(
            'SELECT * FROM session_players WHERE player_telegram_id = ?'
        ).get(playerTelegramID);

        if (existingPlayer) {
            return 'Player already exists';
        };

        const postPlayer = db.prepare(
            `INSERT INTO session_players (session_id,
                                          player_telegram_id,
                                          player_name) VALUES (1, ?, ?)
        `);

        const postPlayerResult = postPlayer.run(
            playerTelegramID,
            playerName
        );

        const newPlayerID = postPlayerResult.lastInsertRowid;
        return newPlayerID;
    } catch (error) {
        console.error('Error in postPlayer:', error);
        return false;
    };
};
