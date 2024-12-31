export function postPlayer(
    db,
    playerTelegramID
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
        console.log(`existingPlayer: ${existingPlayer}`);
        if (existingPlayer) {
            return 'Player already exists';
        };
        console.log(`Preparing query to add player with Telegram ID: ${playerTelegramID}`);
        const postPlayer = db.prepare(
            `INSERT INTO session_players (session_id,
                                          player_telegram_id) VALUES (1, ?)
        `);
        console.log(`Executing query to add player with Telegram ID: ${playerTelegramID}`);
        const postPlayerResult = postPlayer.run(
            playerTelegramID
        );
        console.log(`postPlayerResult: ${postPlayerResult}`);
        const newPlayerID = postPlayerResult.lastInsertRowid;
        return newPlayerID;
    } catch (error) {
        console.error('Error in postPlayer:', error);
        return false;
    };
};
