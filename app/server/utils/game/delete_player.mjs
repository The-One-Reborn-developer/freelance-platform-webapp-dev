export function deletePlayer(
    db,
    playerTelegramID,
    sessionID
) {
    if (!playerTelegramID) {
        return {
            success: false,
            status: 400,
            message: 'Telegram ID игрока не предоставлен'
        };
    };
    
    const existingPlayer = db.prepare(
        'SELECT * FROM session_players WHERE player_telegram_id = ? AND session_id = ?'
    ).get(playerTelegramID, sessionID);

    if (!existingPlayer) {
        return {
            success: false,
            status: 404,
            message: `Игрок с Telegram ID ${playerTelegramID} не найден`
        };
    };

    const deletePlayer = db.prepare(
        `DELETE FROM session_players WHERE player_telegram_id = ? AND session_id = ?`
    );

    const deletePlayerResult = deletePlayer.run(
        playerTelegramID,
        sessionID
    );

    if (!deletePlayerResult) {
        return {
            success: false,
            status: 500,
            message: `Ошибка при удалении игрока с Telegram ID ${playerTelegramID}`
        };
    } else {
        return {
            success: true,
            status: 201,
            message: `Игрок с Telegram ID ${playerTelegramID} успешно удален`
        };
    };
};
