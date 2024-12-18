export function postUser(
    db,
    res,
    telegramID,
    role,
    name,
    rate,
    experience,
    dateOfBirth,
    hasCar,
    carModel,
    carDimensionsWidth,
    carDimensionsLength,
    carDimensionsHeight,
    service
) {
    try {
        // Sanitize data
        const sanitizedRate = sanitizeData(rate);
        const sanitizedExperience = sanitizeData(experience);
        const sanitizedDateOfBirth = sanitizeData(dateOfBirth);
        const sanitizedHasCar = sanitizeData(hasCar);
        const sanitizedCarModel = sanitizeData(carModel);
        const sanitizedCarDimensionsWidth = sanitizeData(carDimensionsWidth);
        const sanitizedCarDimensionsLength = sanitizeData(carDimensionsLength);
        const sanitizedCarDimensionsHeight = sanitizeData(carDimensionsHeight);

        console.log(`Registration attempt for ${telegramID} with role ${role}
            name ${name}, rate ${sanitizedRate}, experience ${sanitizedExperience},
            date of birth ${sanitizedDateOfBirth}, has car ${sanitizedHasCar}, car model ${sanitizedCarModel},
            car dimensions width ${sanitizedCarDimensionsWidth}, car dimensions length ${sanitizedCarDimensionsLength},
            car dimensions height ${sanitizedCarDimensionsHeight}, service ${service}`);

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

        const registrationDate = new Date().toLocaleString(
            'ru-RU',
            { 
                timeZone: 'Europe/Moscow',
                hour: '2-digit',
                minute: '2-digit',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });

        // Insert the new user
        if (service === 'services') {
            const insertUser = db.prepare(
                `INSERT INTO users (
                telegram_id,
                services_role,
                name,
                rate,
                experience,
                registered_in_services,
                registration_date) VALUES (?, ?, ?, ?, ?, ?, ?)`
            );
            
            const insertUserResult = insertUser.run(
                telegramID,
                role,
                name,
                sanitizedRate,
                sanitizedExperience,
                1,
                registrationDate
            );

            res.status(201).json({
                success: true,
                message: 'Пользователь ' + name +
                ' с ID ' + insertUserResult.lastInsertRowid +
                ' успешно зарегистрирован.',
                telegram_id: telegramID
            });
        } else if (service === 'delivery') {
            const insertUser = db.prepare(
                `INSERT INTO users (
                telegram_id,
                deliveries_role,
                name,
                date_of_birth,
                has_car,
                car_model,
                car_dimensions_width,
                car_dimensions_length,
                car_dimensions_height,
                registered_in_deliveries,
                registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );
            
            const insertUserResult = insertUser.run(
                telegramID,
                role,
                name,
                sanitizedDateOfBirth,
                sanitizedHasCar,
                sanitizedCarModel,
                sanitizedCarDimensionsWidth,
                sanitizedCarDimensionsLength,
                sanitizedCarDimensionsHeight,
                1,
                registrationDate
            );

            res.status(201).json({
                success: true,
                message: 'Пользователь ' + name +
                ' с ID ' + insertUserResult.lastInsertRowid +
                ' успешно зарегистрирован.',
                telegram_id: telegramID
            });
        };
    } catch (error) {
        console.error('Error in postUser:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
};


function sanitizeData(input) {
    return input === undefined ? null : input;
};