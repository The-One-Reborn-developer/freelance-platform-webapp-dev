export function updateGamePair(
    db,
    sessionID,
    round,
    winnerTelegramID,
    loserTelegramID
) {
    if (
        !sessionID ||
        !round ||
        !winnerTelegramID ||
        !loserTelegramID
    ) {
        return {
            success: false,
            status: 400,
            message: 'Недостаточно данных для обновления пары игроков'
        };
    };

    sessionID = parseInt(sessionID, 10);
    round = parseInt(round, 10);
    winnerTelegramID = parseInt(winnerTelegramID, 10);
    loserTelegramID = parseInt(loserTelegramID, 10);

    const updateGamePairResult = db.prepare(`
        UPDATE game_pairs SET winner_telegram_id = ? WHERE session_id = ?
        AND round = ?
        AND (player1_telegram_id = ? OR player2_telegram_id = ?)
    `).run(winnerTelegramID, sessionID, round, winnerTelegramID, loserTelegramID);

    if (!updateGamePairResult) {
        return {
            success: false,
            status: 404,
            message: 'Пара игроков не найдена'
        };
    };

    return {
        success: true,
        status: 200,
        message: 'Пара игроков обновлена'
    };
};
