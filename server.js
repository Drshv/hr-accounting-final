const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/api/employees', (req, res) => {
    const sql = `
        SELECT 
            e.*,
            d.name as department_name,
            p.name as position_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        ORDER BY e.id DESC
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/lists', (req, res) => {
    db.all('SELECT * FROM departments', [], (err, departments) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        db.all('SELECT * FROM positions', [], (err, positions) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ departments, positions });
        });
    });
});

app.post('/api/employees', (req, res) => {
    const {
        full_name, birth_date, passport_series, passport_number,
        phone, email, address, department_id, position_id,
        salary, hire_date
    } = req.body;

    const sql = `
        INSERT INTO employees (
            full_name, birth_date, passport_series, passport_number,
            phone, email, address, department_id, position_id,
            salary, hire_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        full_name, birth_date, passport_series, passport_number,
        phone, email, address, department_id, position_id,
        salary, hire_date
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Employee added successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});