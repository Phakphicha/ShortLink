const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const db = new sqlite3.Database('./urls.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            short_code TEXT UNIQUE NOT NULL,
            original_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
});

// Helper function to validate URL
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// Generate a random 6-character short code
const generateShortCode = () => {
    return crypto.randomBytes(3).toString('hex'); // 6 characters
};

// POST endpoint to shorten URL
app.post('/api/shorten', (req, res) => {
    const { original_url } = req.body;

    if (!original_url || !isValidUrl(original_url)) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    const short_code = generateShortCode();

    const stmt = db.prepare('INSERT INTO urls (short_code, original_url) VALUES (?, ?)');
    stmt.run(short_code, original_url, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({
            short_code,
            original_url,
            short_url: `http://localhost:${PORT}/${short_code}`
        });
    });
    stmt.finalize();
});

// GET endpoint to redirect to original URL
app.get('/:code', (req, res) => {
    const { code } = req.params;

    db.get('SELECT original_url FROM urls WHERE short_code = ?', [code], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            return res.redirect(301, row.original_url);
        } else {
            return res.status(404).send(`
                <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                    <h1>404 Not Found</h1>
                    <p>The short link does not exist.</p>
                    <a href="/">Go back home</a>
                </div>
            `);
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
