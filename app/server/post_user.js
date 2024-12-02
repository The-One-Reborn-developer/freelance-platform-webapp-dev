export function postUser(db, res, telegram_id, role, name, rate, experience) {
    try {
        // Check if the user is already registered
        const checkUser = db.prepare(
            'SELECT COUNT(*) as count FROM users WHERE telegram_id = ? OR name = ?'
        );
        const checkUserResult = checkUser.get(telegram_id, name);
        if (checkUserResult) {
            const message = checkUserResult.telegram_id === telegram_id
                                ? 'Вы уже зарегистрированы.'
                                : 'Пользователь с таким именем уже зарегистрирован.';
            res.status(400).json({ message });
            return;
        };

        // Insert the new user
        const insertUser = db.prepare(
            'INSERT INTO users (telegram_id, role, name, rate, experience) VALUES (?, ?, ?, ?, ?)'
        );
        const insertUserResult = insertUser.run(telegram_id, role, name, rate, experience);
        res.status(201).json({
            message: 'Пользователь ' + name +
            ' с ID ' + insertUserResult.lastInsertRowid +
            ' успешно зарегистрирован.'
        });
    } catch (error) {
        console.error('Error in postUser:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
};