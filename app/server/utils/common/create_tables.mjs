export function createUsersTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id BIGINT NOT NULL,
                services_role STRING(20),
                delivery_role STRING(20),
                services_name TEXT,
                delivery_name TEXT,
                game_name TEXT,
                rate INTEGER,
                experience INTEGER,
                date_of_birth STRING(20),
                has_car BOOLEAN,
                car_model TEXT,
                car_width INTEGER,
                car_length INTEGER,
                car_height INTEGER,
                game_wallet FLOAT DEFAULT 0,
                registered_in_services BOOLEAN DEFAULT FALSE,
                registered_in_delivery BOOLEAN DEFAULT FALSE,
                registered_in_game BOOLEAN DEFAULT FALSE,
                services_registration_date STRING(20),
                delivery_registration_date STRING(20),
                game_registration_date STRING(20),
                UNIQUE(telegram_id)
            );
        `);
        console.log('Users table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating users table:', error);
    };
};


export function createBidsTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS bids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_telegram_id BIGINT NOT NULL,
                customer_name STRING(255) NOT NULL,
                city STRING(50) NOT NULL,
                description TEXT NOT NULL,
                deadline_from STRING(20) NOT NULL,
                deadline_to STRING(20) NOT NULL,
                instrument_provided BOOLEAN NOT NULL,
                closed BOOLEAN DEFAULT FALSE
            );
        `);
        console.log('Bids table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating bids table:', error);
    };
};


export function createDeliveriesTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS deliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_telegram_id BIGINT NOT NULL,
                customer_name STRING(255) NOT NULL,
                city STRING(50) NOT NULL,
                description TEXT NOT NULL,
                deliver_from TEXT NOT NULL,
                deliver_to TEXT NOT NULL,
                car_necessary BOOLEAN NOT NULL,
                closed BOOLEAN DEFAULT FALSE
            );
        `);
        console.log('Deliveries table check or creation executed successfully');
    } catch (error) {
        console.error(`Error creating deliveries table: ${error}`);
    };
};


export function createServicesResponsesTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS services_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bid_id INTEGER NOT NULL,
                performer_telegram_id BIGINT NOT NULL,
                performer_name STRING(255) NOT NULL,
                performer_rate INTEGER NOT NULL,
                performer_experience INTEGER NOT NULL,
                performer_registration_date STRING(20) NOT NULL,
                chat_started BOOLEAN DEFAULT FALSE,
                FOREIGN KEY(bid_id) REFERENCES bids(id) ON DELETE CASCADE,
                UNIQUE(bid_id, performer_telegram_id)
            );
        `);
        console.log('Services responses table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating responses table:', error);
    };
};


export function createDeliveriesResponsesTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS deliveries_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                delivery_id INTEGER NOT NULL,
                courier_telegram_id BIGINT NOT NULL,
                courier_name STRING(255) NOT NULL,
                courier_date_of_birth STRING(20) NOT NULL,
                courier_has_car BOOLEAN NOT NULL,
                courier_car_model STRING(255),
                courier_car_width INTEGER,
                courier_car_length INTEGER,
                courier_car_height INTEGER,
                courier_registration_date STRING(20) NOT NULL,
                chat_started BOOLEAN DEFAULT FALSE,
                FOREIGN KEY(delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
                UNIQUE(delivery_id, courier_telegram_id)
            );
        `);
        console.log('Deliveries responses table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating responses table:', error);
    };
};
