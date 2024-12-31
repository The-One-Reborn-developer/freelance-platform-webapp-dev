export function deletePlayer(
    db,
    playerTelegramID
) {
    if (!playerTelegramID) {
        return {
            success: false,
            status: 400,
            message: 'Telegram ID игрока не предоставлен'
        };
    };
    // TODO: make session_id dynamic
    
    const existingPlayer = db.prepare(
        'SELECT * FROM session_players WHERE player_telegram_id = ? AND session_id = 1'
    ).get(playerTelegramID);

    if (!existingPlayer) {
        return {
            success: false,
            status: 404,
            message: `Игрок с Telegram ID ${playerTelegramID} не найден`
        };
    };

    const deletePlayer = db.prepare(
        `DELETE FROM session_players WHERE player_telegram_id = ? AND session_id = 1`
    );

    const deletePlayerResult = deletePlayer.run(
        playerTelegramID
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
