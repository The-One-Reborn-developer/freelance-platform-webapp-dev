import Database from "better-sqlite3";
import express from "express";
import crypto from "crypto";

const app = express();
console.log('Express app created');

const db = new Database('./app/database.db', { verbose: console.log });
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


app.use(express.json());
app.use(express.static('app/public'));


app.get('/', (req, res) => {
    res.sendFile('app/public/register.html', { root: './' });    
})


app.post('/register', (req, res) => {
    const { role, name, rate, experience, telegram_data } = req.body;
    
    if (!telegram_data) {
        res.status(400).json({
            message: 'Телеграм-данные не переданы'
        });
        return;
    };

    console.log(telegram_data);

    const botToken = process.env.BOT_TOKEN;
    const secretKey = crypto.createHmac(
        'sha256',
        'WebAppData'
    ).update(botToken).digest();

    const dataCheckString = telegram_data.split('&')
        .filter(pair => pair.split('=')[0] !== 'hash')  // Exclude the hash itself
        .sort()
        .join('\n');  // Format as key=value\n

    const computedHash = crypto.createHmac(
        'sha256',
        secretKey
    ).update(dataCheckString).digest('hex');

    const receivedHash = new URLSearchParams(telegram_data).get('hash');

    if (computedHash !== receivedHash) {
        res.status(400).json({
            message: 'Неверные телеграм-данные'
        });
        return;
    };

    // Check if data is outdated
    const authDate = parseInt(new URLSearchParams(telegram_data).get('auth_date'), 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {  // 24 hours
        res.status(400).json({
            message: 'Телеграм-данные устарели'
        });
        return;
    }

    // Check for duplicate name
    const checkName = db.prepare(
        'SELECT COUNT(*) as count FROM users WHERE name = ?'
    );
    const result = checkName.get(name);

    if (result.count > 0) {
        res.status(400).json({
            message: 'Пользователь с таким именем уже зарегистрирован'
        });
        return;
    };

    const insertUser = db.prepare(
        'INSERT INTO users (role, name, rate, experience) VALUES (?, ?, ?, ?)'
    );
    const insertUserInfo = insertUser.run(role, name, rate, experience);
    res.status(201).json({
        message: 'Пользователь ' + name +
        ' с ID ' + insertUserInfo.lastInsertRowid +
        ' успешно зарегистрирован'
    });
})


app.listen(3000, () => {
    console.log('Server started on port 3000');
});