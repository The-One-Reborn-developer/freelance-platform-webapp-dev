export function postPlayer(
    db,
    playerTelegramID,
    playerName
) {
    if (!playerTelegramID || !playerName) {
        console.error('Player Telegram ID or player name not provided');
        return {
            success: false,
            status: 400,
            message: 'Player Telegram ID or player name not provided'
        };
    };
    // TODO: make session_id dynamic
    try {
        const existingPlayer = db.prepare(
            'SELECT * FROM session_players WHERE player_telegram_id = ?'
        ).get(playerTelegramID);

        if (existingPlayer) {
            return {
                success: false,
                status: 409,
                message: `Игрок с Telegram ID ${playerTelegramID} уже зарегистрирован`
            };
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
        return {
            success: true,
            status: 201,
            message: `Игрок с Telegram ID ${playerTelegramID} успешно зарегистрирован. ID игрока: ${newPlayerID}`
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Произошла ошибка при регистрации игрока: ${error}`
        };
    };
};
