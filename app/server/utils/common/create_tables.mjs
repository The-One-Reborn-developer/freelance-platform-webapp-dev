export function createUsersTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id BIGINT NOT NULL,
                services_role STRING(20),
                delivery_role STRING(20),
                services_name STRING(255),
                delivery_name STRING(255),
                game_name STRING(255),
                rate INTEGER,
                experience INTEGER,
                date_of_birth TEXT,
                has_car BOOLEAN,
                car_model TEXT,
                car_width INTEGER,
                car_length INTEGER,
                car_height INTEGER,
                game_wallet FLOAT DEFAULT 0,
                registered_in_services BOOLEAN DEFAULT FALSE,
                registered_in_delivery BOOLEAN DEFAULT FALSE,
                registered_in_game BOOLEAN DEFAULT FALSE,
                services_registration_date TEXT,
                delivery_registration_date TEXT,
                game_registration_date TEXT,
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
                performer_registration_date TEXT NOT NULL,
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
                courier_date_of_birth TEXT NOT NULL,
                courier_has_car BOOLEAN NOT NULL,
                courier_car_model STRING(255),
                courier_car_width INTEGER,
                courier_car_length INTEGER,
                courier_car_height INTEGER,
                courier_registration_date TEXT NOT NULL,
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


export function createGameSessionsTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS game_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_date TEXT NOT NULL,
                players_amount INTEGER DEFAULT 0,
                countdown_timer INTEGER DEFAULT 5,
                started BOOLEAN DEFAULT FALSE,
                finished BOOLEAN DEFAULT FALSE
            );
        `);
        console.log('Game sessions table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating game sessions table:', error);
    };
};


export function createSessionPlayersTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS session_players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                player_telegram_id BIGINT NOT NULL,
                player_name STRING(255) NOT NULL,
                FOREIGN KEY(session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
            );
        `);
        console.log('Session players table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating session players table:', error);
    };
};


export function createGamePairsTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS game_pairs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                round INTEGER NOT NULL,
                player1_telegram_id BIGINT NOT NULL,
                player2_telegram_id BIGINT NOT NULL,
                player1_choice INTEGER,
                player2_choice INTEGER,
                winner_telegram_id BIGINT,
                FOREIGN KEY(session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
            );
        `);
    } catch (error) {
        console.error('Error creating game pairs table:', error);
    };
};


export function createGameSessionAdsTable(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS game_session_ads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                ad_path TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
            );
        `);
        console.log('Game sessions ads table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating game sessions ads table:', error);
    };
};
