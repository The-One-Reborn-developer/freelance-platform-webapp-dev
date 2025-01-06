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

    const insertGameChoiceResult = db.prepare(
        'INSERT INTO game_pairs (session_id, round, player_telegram_id, player_choice) VALUES (?, ?, ?, ?)'
    ).run(sessionID, round, playerTelegramID, playerChoice);


    return {
        success: true,
        status: 200,
        message: 'Выбор игрока добавлен'
    };
};
