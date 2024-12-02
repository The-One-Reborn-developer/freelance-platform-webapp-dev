import Database from "better-sqlite3";
import express from "express";
import dotenv from "dotenv";

import { createTables } from "./create_tables.js";
import { checkTelegramData } from "./check_telegram_data.js";
import { postUser } from "./post_user.js";


dotenv.config({ path: '/app/.env' });

const app = express();
app.use(express.json());
app.use(express.static('app/public'));
console.log('Express app created');

const db = new Database('./app/database.db', { verbose: console.log });
console.log('Database created');

createTables(db);


app.get('/', (req, res) => {
    res.sendFile('app/public/register.html', { root: './' });    
});


app.post('/register', async (req, res) => {
    try {
        // Check telegram data
        const checkTelegramDataResult = checkTelegramData(req, res);

        if (!checkTelegramDataResult) {
            return;
        } else {
            // Post the new user
            postUser(
                db,
                res,
                checkTelegramDataResult.telegram_id,
                checkTelegramDataResult.role,
                checkTelegramDataResult.name,
                checkTelegramDataResult.rate,
                checkTelegramDataResult.experience,
            );
        };
    } catch (error) {
        console.error('Error in /register:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя.' });
    };
});


// 404 Route
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});


// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Unexpected server error.' });
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});