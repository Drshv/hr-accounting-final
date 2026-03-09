const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'employees.db'));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        passport_series TEXT NOT NULL,
        passport_number TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        position_id INTEGER NOT NULL,
        salary REAL NOT NULL,
        hire_date TEXT NOT NULL,
        is_fired INTEGER DEFAULT 0,
        fired_at TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments (id),
        FOREIGN KEY (position_id) REFERENCES positions (id)
    )`);

    const departments = ['IT', 'HR', 'Sales', 'Marketing'];
    const positions = ['Junior', 'Middle', 'Senior', 'Lead'];

    departments.forEach(dept => {
        db.run('INSERT OR IGNORE INTO departments (name) VALUES (?)', [dept]);
    });

    positions.forEach(pos => {
        db.run('INSERT OR IGNORE INTO positions (name) VALUES (?)', [pos]);
    });
});

console.log('Database ready');

module.exports = db;