import Database from "better-sqlite3";
import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: '/app/.env' });

const app = express();
console.log('Express app created');

const db = new Database('./app/database.db', { verbose: console.log });
console.log('Database created');


db.exec(
    `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id BIGINT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        rate INTEGER NOT NULL,
        experience INTEGER NOT NULL
    );
    `
);
console.log('Users table created');


app.use(express.json());
app.use(express.static('app/public'));


app.get('/', (req, res) => {
    res.sendFile('app/public/register.html', { root: './' });    
})


app.post('/register', (req, res) => {
    const { role, name, rate, experience } = req.body;
    const telegram_data = req.body.telegram_data;

    // Get Telegram ID
    const userDataString = new URLSearchParams(telegram_data).get('user');
    const userData = JSON.parse(decodeURIComponent(userDataString));
    const telegram_id = userData.id;

    if (typeof telegram_data !== 'string') {
        res.status(400).json({
            message: 'Телеграм-данные не в корректном формате.'
        });
        return;
    };

    if (!telegram_data) {
        res.status(400).json({
            message: 'Телеграм-данные не переданы.'
        });
        return;
    };

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const secretKey = crypto.createHmac(
        'sha256',
        'WebAppData'
    ).update(botToken).digest();

    const dataCheckString = telegram_data.split('&')
    .filter(pair => pair.split('=')[0] !== 'hash')  // Exclude the hash itself
    .sort()
    .map(pair => pair.split('=')[0] + '=' + decodeURIComponent(pair.split('=')[1]))  // Decode the values
    .join('\n');  // Format as key=value\n

    const computedHash = crypto.createHmac(
        'sha256',
        secretKey
    ).update(dataCheckString).digest('hex');

    const receivedHash = new URLSearchParams(telegram_data).get('hash');

    if (computedHash !== receivedHash) {
        res.status(400).json({
            message: 'Неверные телеграм-данные.'
        });
        return;
    };

    // Check if data is outdated
    const authDate = parseInt(new URLSearchParams(telegram_data).get('auth_date'), 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {  // 24 hours
        res.status(400).json({
            message: 'Телеграм-данные устарели.'
        });
        return;
    }

    // Check if the user is already registered
    const checkUser = db.prepare(
        'SELECT COUNT(*) as count FROM users WHERE telegram_id = ?'
    );
    const checkUserResult = checkUser.get(telegram_id);
    if (checkUserResult.count > 0) {
        res.status(400).json({
            message: 'Вы уже зарегистрированы.'
        });
        return;
    }

    // Check for duplicate name
    const checkName = db.prepare(
        'SELECT COUNT(*) as count FROM users WHERE name = ?'
    );
    const checkNameResult = checkName.get(name);
    if (checkNameResult.count > 0) {
        res.status(400).json({
            message: 'Пользователь с таким именем уже зарегистрирован.'
        });
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
})


app.listen(3000, () => {
    console.log('Server started on port 3000');
});