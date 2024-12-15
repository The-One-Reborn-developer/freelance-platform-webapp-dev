export function postUser(db, res, telegramID, role, name, rate, experience) {
    try {
        // Check if the user is already registered
        const checkUserTelegram = db.prepare(
            'SELECT COUNT(*) as count FROM users WHERE telegram_id = ?'
        );
        const checkUserTelegramResult = checkUserTelegram.get(telegramID);
        if (checkUserTelegramResult.count > 0) {
            res.status(409).json({ message: 'Вы уже зарегистрированы.' });
            return;
        };

        // Check if the name is already taken
        const checkUserName = db.prepare(
            'SELECT COUNT(*) as count FROM users WHERE name = ?'
        );
        const checkUserNameResult = checkUserName.get(name);
        if (checkUserNameResult.count > 0) {
            res.status(409).json({ message: 'Имя ' + name + ' уже занято.' });
            return;
        };

        // Insert the new user
        const insertUser = db.prepare(
            'INSERT INTO users (telegram_id, role, name, rate, experience, registration_date) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const registrationDate = new Date().toLocaleString();
        const insertUserResult = insertUser.run(telegramID, role, name, rate, experience, registrationDate);
        res.status(201).json({
            success: true,
            message: 'Пользователь ' + name +
            ' с ID ' + insertUserResult.lastInsertRowid +
            ' успешно зарегистрирован.',
            telegram_id: telegramID
        });
    } catch (error) {
        console.error('Error in postUser:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
};