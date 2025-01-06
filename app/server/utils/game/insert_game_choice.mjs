export function insertGameChoice(
    db,
    sessionID,
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
        'INSERT INTO game_choices (session_id, player_telegram_id, player_choice) VALUES (?, ?, ?)'
    ).run(sessionID, playerTelegramID, playerChoice);


    
};
