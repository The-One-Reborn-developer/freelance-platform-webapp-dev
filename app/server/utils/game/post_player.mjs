export function postPlayer(
    db,
    sessionID,
    playerTelegramID,
    playerName
) {
    if (!playerTelegramID || !playerName) {
        console.error('Player Telegram ID or player name not provided');
        return {
            success: false,
            status: 400,
            message: 'Телеграм ID игрока или имя игрока не предоставлены'
        };
    };
    
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
                                      player_name) VALUES (?, ?, ?)
    `);

    const postPlayerResult = postPlayer.run(
        sessionID,
        playerTelegramID,
        playerName
    );

    const newPlayerID = postPlayerResult.lastInsertRowid;
    return {
        success: true,
        status: 201,
        message: `Игрок с Telegram ID ${playerTelegramID} успешно зарегистрирован. ID игрока: ${newPlayerID}`
    };
};
