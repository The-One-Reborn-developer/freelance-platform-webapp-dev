export function insertGameChoice(
    db,
    sessionID,
    round,
    playerTelegramID,
    playerChoice
) {
    if (
        !sessionID ||
        !playerTelegramID ||
        !playerChoice
    ) {
        return {
            success: false,
            status: 400,
            message: 'Недостаточно данных для добавления выбора игрока'
        };
    };

    const gamePair = db.prepare(`
        SELECT id, player1_telegram_id, player2_telegram_id
        FROM game_pairs
        WHERE session_id = ? AND round = ?
        AND (player1_telegram_id = ? OR player2_telegram_id = ?)
    `).run(sessionID, round, playerTelegramID, playerTelegramID);

    if (!gamePair) {
        return {
            success: false,
            status: 404,
            message: 'Игровая пара не найдена'
        };
    };

    let updateQuery = '';
    if (gamePair.player1_telegram_id === playerTelegramID) {
        updateQuery = `
            UPDATE game_pairs
            SET player1_choice = ?
            WHERE id = ?
        `;
    } else if (gamePair.player2_telegram_id === playerTelegramID) {
        updateQuery = `
            UPDATE game_pairs
            SET player2_choice = ?
            WHERE id = ?
        `;
    } else {
        return {
            success: false,
            status: 404,
            message: 'Игрок не найден в игровой паре'
        };
    };

    db.prepare(updateQuery).run(playerChoice, gamePair.id);

    return {
        success: true,
        status: 200,
        message: 'Выбор игрока добавлен'
    };
};
