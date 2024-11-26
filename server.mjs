import Database from "better-sqlite3";
import express from "express";


const app = express();
const db = new Database('app/database/database.db', { verbose: console.log });


app.use(express.json());


app.get('/', (req, res) => {
    res.sendFile('app/public/register.html', { root: './' });    
})


app.post('/register', (req, res) => {
    const { role, name, rate, experience } = req.body;

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


app.use(express.static('app/public'));
app.listen(3000, () => console.log('Server running on http://localhost:3000'));