function createTables(db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id BIGINT NOT NULL,
                role TEXT NOT NULL,
                name TEXT NOT NULL,
                rate INTEGER NOT NULL,
                experience INTEGER NOT NULL
            );
        `);
        console.log('Users table check or creation executed successfully');
    } catch (error) {
        console.error('Error creating users table:', error);
    }
}