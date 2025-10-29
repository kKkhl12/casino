// --- server.js ---
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
app.use(express.static('.')); // Serve your HTML, CSS, and client-side JS
app.use(express.json()); // Allow server to read JSON from requests

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const saltRounds = 10;

// --- Database Setup ---
const db = new sqlite3.Database('./casino.db', (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            balance REAL DEFAULT 1000
        )`);
    }
});

// --- API Endpoints for Auth ---
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password.' });
        }
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.run(sql, [username, hash], function(err) {
            if (err) {
                return res.status(400).json({ message: 'Username already exists.' });
            }
            res.json({ message: 'User registered successfully!', userId: this.lastID });
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                res.json({ 
                    message: 'Login successful!',
                    username: user.username,
                    balance: user.balance,
                    isAdmin: user.username.toLowerCase() === 'hexeriss' // Example admin check
                });
            } else {
                res.status(400).json({ message: 'Invalid credentials.' });
            }
        });
    });
});

// --- WebSocket Logic ---
wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        const data = JSON.parse(message);
        
        // Broadcast chat messages to all clients
        if (data.type === 'chat') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'chat',
                        username: data.username,
                        message: data.message
                    }));
                }
            });
        }
        
        // Handle other game actions here (e.g., placing a bet)
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// --- Game Logic (Example: Global Crash Game) ---
let crashState = {
    status: 'waiting', // waiting, running, crashed
    multiplier: 1.00,
    crashPoint: 0,
    interval: null
};

function runCrashGame() {
    if (crashState.status !== 'waiting') return;

    crashState.status = 'running';
    crashState.multiplier = 1.00;
    const r = Math.random();
    crashState.crashPoint = Math.max(1.0, 1 / (1 - r) * 0.98);

    console.log(`New crash game started. Will crash at ${crashState.crashPoint.toFixed(2)}x`);

    crashState.interval = setInterval(() => {
        // Dynamic increment makes the curve more realistic
        const increment = 0.01 + (crashState.multiplier * 0.01);
        crashState.multiplier += increment;

        if (crashState.multiplier >= crashState.crashPoint) {
            // Game crashed
            crashState.status = 'crashed';
            clearInterval(crashState.interval);
            
            // Broadcast the final crash state
             wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    type: 'crash_update',
                    status: 'crashed',
                    multiplier: crashState.crashPoint
                }));
            });

            // Reset for the next game after a delay
            setTimeout(() => {
                crashState.status = 'waiting';
                runCrashGame();
            }, 5000); // 5-second wait

        } else {
            // Broadcast the running multiplier
            wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    type: 'crash_update',
                    status: 'running',
                    multiplier: crashState.multiplier
                }));
            });
        }
    }, 100);
}


// Start the first game after a short delay
setTimeout(runCrashGame, 5000); 

// --- Start the Server ---
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
    console.log("Open http://localhost:3000 in your browser.");
});
