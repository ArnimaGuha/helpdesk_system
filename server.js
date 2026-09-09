const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'helpdesk_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Middleware to check roles
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/login');
}

// Routes
app.get('/', (req, res) => res.redirect('/login'));

// Login Page
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            if (user.role === 'client') res.redirect('/client/dashboard');
            else if (user.role === 'agent') res.redirect('/agent/dashboard');
            else if (user.role === 'admin') res.redirect('/admin/dashboard');
        } else {
            res.render('login', { error: 'Invalid Email or Password' });
        }
    });
});

// Register Page (Mainly for Clients and creating testing Agents)
app.get('/register', (req, res) => res.render('register', { error: null }));
app.post('/register', async (req, res) => {
    const { name, email, password, role, domain } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (name, email, password, role, domain) VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role || 'client', domain || null], (err) => {
            if (err) return res.render('register', { error: 'Email already exists' });
            res.redirect('/login');
        });
});

// --- CLIENT ROUTES ---
app.get('/client/dashboard', isAuthenticated, (req, res) => {
    db.all(`SELECT tickets.*, users.name as agent_name FROM tickets 
            LEFT JOIN users ON tickets.agent_id = users.id 
            WHERE client_id = ?`, [req.session.user.id], (err, tickets) => {
        res.render('client_dashboard', { user: req.session.user, tickets });
    });
});

app.get('/client/raise', isAuthenticated, (req, res) => {
    res.render('raise_issue', { user: req.session.user });
});

app.post('/client/raise', isAuthenticated, (req, res) => {
    const { title, domain, description } = req.body;
    db.run(`INSERT INTO tickets (client_id, title, domain, description) VALUES (?, ?, ?, ?)`,
        [req.session.user.id, title, domain, description], () => {
            res.redirect('/client/dashboard');
        });
});

app.post('/client/feedback/:id', isAuthenticated, (req, res) => {
    const { rating, comments } = req.body;
    const ticketId = req.params.id;
    db.run(`INSERT INTO feedback (ticket_id, client_id, rating, comments) VALUES (?, ?, ?, ?)`,
        [ticketId, req.session.user.id, rating, comments], () => {
            res.redirect('/client/dashboard');
        });
});

// --- AGENT ROUTES ---
app.get('/agent/dashboard', isAuthenticated, (req, res) => {
    const agentDomain = req.session.user.domain;
    db.all(`SELECT tickets.*, users.name as client_name FROM tickets 
            JOIN users ON tickets.client_id = users.id 
            WHERE tickets.domain = ?`, [agentDomain], (err, tickets) => {
        res.render('agent_dashboard', { user: req.session.user, tickets });
    });
});

app.get('/agent/ticket/:id', isAuthenticated, (req, res) => {
    db.get(`SELECT tickets.*, users.name as client_name FROM tickets 
            JOIN users ON tickets.client_id = users.id 
            WHERE tickets.id = ?`, [req.params.id], (err, ticket) => {
        db.get(`SELECT * FROM feedback WHERE ticket_id = ?`, [ticket.id], (err, feedback) => {
            res.render('agent_ticket', { user: req.session.user, ticket, feedback });
        });
    });
});

app.post('/agent/ticket/:id', isAuthenticated, (req, res) => {
    const { solution, status } = req.body;
    db.run(`UPDATE tickets SET solution = ?, status = ?, agent_id = ? WHERE id = ?`,
        [solution, status, req.session.user.id, req.params.id], () => {
            res.redirect('/agent/dashboard');
        });
});

// --- ADMIN ROUTES ---
app.get('/admin/dashboard', isAuthenticated, (req, res) => {
    db.get(`SELECT 
        (SELECT COUNT(*) FROM tickets) as total_tickets,
        (SELECT COUNT(*) FROM tickets WHERE status = 'Open') as open_tickets,
        (SELECT COUNT(*) FROM tickets WHERE status = 'Resolved') as solved_tickets,
        (SELECT COUNT(*) FROM users WHERE role = 'client') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'agent') as total_agents,
        (SELECT AVG(rating) FROM feedback) as avg_feedback`, [], (err, stats) => {
        
        db.all(`SELECT feedback.*, users.name as client_name FROM feedback 
                JOIN users ON feedback.client_id = users.id`, [], (err, feedbacks) => {
            res.render('admin_dashboard', { user: req.session.user, stats, feedbacks });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));