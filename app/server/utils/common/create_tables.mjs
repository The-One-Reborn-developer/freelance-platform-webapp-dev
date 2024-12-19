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
                rate INTEGER,
                experience INTEGER,
                date_of_birth STRING(20),
                has_car BOOLEAN,
                car_model TEXT,
                car_dimensions_width INTEGER,
                car_dimensions_length INTEGER,
                car_dimensions_height INTEGER,
                registered_in_services BOOLEAN DEFAULT FALSE,
                registered_in_delivery BOOLEAN DEFAULT FALSE,
                services_registration_date STRING(20),
                delivery_registration_date STRING(20),
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
                deliver_from STRING(20) NOT NULL,
                deliver_to STRING(20) NOT NULL,
                car_necessary BOOLEAN NOT NULL,
                closed BOOLEAN DEFAULT FALSE
            );
        `);
        console.log('Deliveries table check or creation executed successfully');
    } catch (error) {
        console.error(`Error creating deliveries table: ${error}`);
    } ;
};


export function createResponsesTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS responses (
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
        console.log('Responses table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating responses table:', error);
    }
}