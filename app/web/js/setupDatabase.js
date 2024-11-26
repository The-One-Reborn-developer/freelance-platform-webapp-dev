const Database = require('better-sqlite3');


const db = new Database('database.db', { verbose: console.log });


console.log('Database created');


db.exec(
    `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        rate INTEGER NOT NULL,
        experience INTEGER NOT NULL
    );
    `
);


console.log('Users table created');


db.close();