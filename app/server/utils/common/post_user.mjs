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
        const sanitizedHasCar = sanitizeData(hasCar) ? 1 : 0;
        const sanitizedCarModel = sanitizeData(carModel);
        const sanitizedCarDimensionsWidth = sanitizeData(carDimensionsWidth);
        const sanitizedCarDimensionsLength = sanitizeData(carDimensionsLength);
        const sanitizedCarDimensionsHeight = sanitizeData(carDimensionsHeight);

        const registrationDate = new Date().toLocaleString(
            'ru-RU',
            { 
                timeZone: 'Europe/Moscow',
                hour: '2-digit',
                minute: '2-digit',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            }
        );

        const userQuery = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
        const user = userQuery.get(telegramID);

        // Check if the user is already registered
        if (!user) {
            // Register a new user
            if (service === 'services') {
                const insertUser = db.prepare(
                    `INSERT INTO users (telegram_id,
                                        services_role,
                                        services_name,
                                        rate,
                                        experience,
                                        registered_in_services,
                                        services_registration_date) VALUES (?, ?, ?, ?, ?, 1, ?)`
                );
                insertUser.run(
                    telegramID,
                    role,
                    name,
                    sanitizedRate,
                    sanitizedExperience,
                    registrationDate
                );
                res.status(201).json({ 
                    success: true,
                    message: `Пользователь ${name} успешно зарегистрирован в Сервис+Услуги.`,
                    telegram_id: telegramID,
                });
            } else if (service === 'delivery') {
                const insertUser = db.prepare(
                    `INSERT INTO users (telegram_id,
                                        delivery_role,
                                        delivery_name,
                                        date_of_birth,
                                        has_car,
                                        car_model,
                                        car_dimensions_width,
                                        car_dimensions_length,
                                        car_dimensions_height,
                                        registered_in_delivery,
                                        delivery_registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
                );
                insertUser.run(
                    telegramID,
                    role,
                    name,
                    sanitizedDateOfBirth,
                    sanitizedHasCar,
                    sanitizedCarModel,
                    sanitizedCarDimensionsWidth,
                    sanitizedCarDimensionsLength,
                    sanitizedCarDimensionsHeight,
                    registrationDate
                );
                res.status(201).json({ 
                    success: true,
                    message: `Пользователь ${name} успешно зарегистрирован в Сервис+Доставка.`,
                    telegram_id: telegramID,
                });
            };
        };

        // Update an existing user
        if (service === 'services') {
            if (user.registered_in_services === 1) {
                res.status(200).json({ 
                    success: true,
                    message: `Пользователь ${name} уже зарегистрирован в Сервис+Услуги.`,
                    telegram_id: telegramID,
                });
                return;
            } else {
                const updateUser = db.prepare(
                    `UPDATE users SET 
                        services_role = ?,
                        services_name = ?,
                        rate = ?,
                        experience = ?,
                        registered_in_services = 1,
                        services_registration_date = ?
                        WHERE telegram_id = ?`
                );
                updateUser.run(
                    role,
                    name,
                    sanitizedRate,
                    sanitizedExperience,
                    registrationDate,
                    telegramID
                );
                res.status(200).json({ 
                    success: true,
                    message: `Пользователь ${name} успешно зарегистрирован в Сервис+Услуги.`,
                    telegram_id: telegramID,
                });
            };
        } else if (service === 'delivery') {
            if (user.registered_in_delivery === 1) {
                res.status(200).json({ 
                    success: true,
                    message: `Пользователь ${name} уже зарегистрирован в Сервис+Доставка.`,
                    telegram_id: telegramID,
                });
                return;
            } else {
                const updateUser = db.prepare(
                    `UPDATE users SET 
                        delivery_role = ?,
                        delivery_name = ?,
                        date_of_birth = ?,
                        has_car = ?,
                        car_model = ?,
                        car_dimensions_width = ?,
                        car_dimensions_length = ?,
                        car_dimensions_height = ?,
                        registered_in_delivery = 1,
                        delivery_registration_date = ?
                        WHERE telegram_id = ?`
                );
                updateUser.run(
                    role,
                    name,
                    sanitizedDateOfBirth,
                    sanitizedHasCar,
                    sanitizedCarModel,
                    sanitizedCarDimensionsWidth,
                    sanitizedCarDimensionsLength,
                    sanitizedCarDimensionsHeight,
                    registrationDate,
                    telegramID
                );
                res.status(200).json({ 
                    success: true,
                    message: `Пользователь ${name} успешно зарегистрирован в Сервис+Доставка.`,
                    telegram_id: telegramID,
                });
            };
        };
    } catch (error) {
        console.error('Error in postUser:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
};


function sanitizeData(input) {
    return input === undefined ? null : input;
};