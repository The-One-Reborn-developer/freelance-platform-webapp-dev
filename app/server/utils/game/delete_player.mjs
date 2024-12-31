export function deletePlayer(
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
            'SELECT * FROM session_players WHERE player_telegram_id = ? AND session_id = 1'
        ).get(playerTelegramID);

        if (!existingPlayer) {
            return 'Player does not exist';
        };

        const deletePlayer = db.prepare(
            `DELETE FROM session_players WHERE player_telegram_id = ? AND session_id = 1`
        );

        const deletePlayerResult = deletePlayer.run(
            playerTelegramID
        );

        return deletePlayerResult;
    } catch (error) {
        console.error('Error in deletePlayer:', error);
        return false;
    };
};
