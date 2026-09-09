const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./helpdesk.db', (err) => {
    if (err) console.error('Database opening error: ', err.message);
    else console.log('Connected to SQLite database.');
});

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT, -- 'client', 'agent', 'admin'
        domain TEXT -- Used for agents (e.g., 'Technical', 'Billing')
    )`);

    // Tickets Table
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        title TEXT,
        domain TEXT,
        description TEXT,
        status TEXT DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved'
        solution TEXT,
        agent_id INTEGER,
        FOREIGN KEY(client_id) REFERENCES users(id),
        FOREIGN KEY(agent_id) REFERENCES users(id)
    )`);

    // Feedback Table
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER,
        client_id INTEGER,
        rating INTEGER,
        comments TEXT,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id),
        FOREIGN KEY(client_id) REFERENCES users(id)
    )`);

    // Seed default Admin if not exists
    db.get(`SELECT * FROM users WHERE email = ?`, ['admin@helpdesk.com'], async (err, row) => {
        if (!row) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                ['System Admin', 'admin@helpdesk.com', hashedPassword, 'admin']);
        }
    });
});

module.exports = db;