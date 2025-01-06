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
        playerChoice === undefined
    ) {
        return {
            success: false,
            status: 400,
            message: 'Недостаточно данных для добавления выбора игрока'
        };
    };

    sessionID = parseInt(sessionID, 10);
    round = parseInt(round, 10);
    console.log(`Session ID: ${sessionID}. Round: ${round}. Player Telegram ID: ${playerTelegramID}. Player Choice: ${playerChoice}`);
    const gamePairResult = db.prepare(`
        SELECT id, player1_telegram_id, player2_telegram_id
        FROM game_pairs
        WHERE session_id = ? AND round = ?
        AND (player1_telegram_id = ? OR player2_telegram_id = ?)
    `).get(sessionID, round, playerTelegramID, playerTelegramID);
    console.log(`Game pair result: ${JSON.stringify(gamePairResult)}`);
    if (!gamePairResult) {
        return {
            success: false,
            status: 404,
            message: 'Игровая пара не найдена'
        };
    };

    let updateQuery = '';
    if (gamePairResult.player1_telegram_id === playerTelegramID) {
        updateQuery = `
            UPDATE game_pairs
            SET player1_choice = ?
            WHERE id = ?
        `;
    } else if (gamePairResult.player2_telegram_id === playerTelegramID) {
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
    console.log(`Update result: ${updateQuery}`);
    const result = db.prepare(updateQuery).run(playerChoice, gamePairResult.id);

    if (!result) {
        return {
            success: false,
            status: 500,
            message: 'Ошибка при добавлении выбора игрока'
        };
    };

    return {
        success: true,
        status: 200,
        message: 'Выбор игрока добавлен'
    };
};
