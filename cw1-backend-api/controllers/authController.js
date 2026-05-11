const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 1. REGISTER
exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email.endsWith('@university.edu')) {
            return res.status(400).json({ error: "Registration requires a @university.edu email address." });
        }
        const [existing] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "Email already registered." });
        }
        const hashedPw = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO Users (email, password_hash) VALUES (?, ?)", [email, hashedPw]);
        
        res.status(201).json({ message: "Registration successful. You can now log in." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during registration." });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    const { email, password, clientPlatform } = req.body;
    try {
        const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
        
        if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        let scopes = ['read:alumni'];
        if (clientPlatform === 'dashboard') scopes.push('read:analytics');
        if (clientPlatform === 'mobile_ar') scopes.push('read:alumni_of_day');

        const token = jwt.sign(
            { id: users[0].id, email: users[0].email, scopes: scopes }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ message: "Login successful", token, scopes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during login." });
    }
};

// 3. REVOKE TOKEN (Logout)
exports.revokeToken = async (req, res) => {
    try {
        await db.query("INSERT INTO RevokedTokens (token) VALUES (?)", [req.token]);
        res.json({ message: "Token successfully revoked. You are securely logged out." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error revoking token." });
    }
};

// 4. USAGE STATS
exports.getUsageStats = async (req, res) => {
    try {
        const [logs] = await db.query("SELECT endpoint, accessed_at FROM AccessLogs ORDER BY accessed_at DESC LIMIT 20");
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching usage statistics." });
    }
};