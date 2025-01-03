export function deletePlayer(
    db,
    playerTelegramID,
    sessionID
) {
    if (!playerTelegramID) {
        return {
            success: false,
            status: 400,
            message: 'Player Telegram ID not provided'
        };
    };
    
    const existingPlayer = db.prepare(
        'SELECT * FROM session_players WHERE player_telegram_id = ? AND session_id = ?'
    ).get(playerTelegramID, sessionID);

    if (!existingPlayer) {
        return {
            success: false,
            status: 404,
            message: `Player with Telegram ID ${playerTelegramID} not found`
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
            message: `Error deleting player with Telegram ID ${playerTelegramID}`
        };
    } else {
        return {
            success: true,
            status: 200,
            message: `Player with Telegram ID ${playerTelegramID} successfully deleted`
        };
    };
};
