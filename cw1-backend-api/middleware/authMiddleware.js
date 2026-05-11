const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// The middleware accepts an array of required scopes
const verifyToken = (requiredScopes = []) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const token = authHeader.split(' ')[1];

        try {
            // 1. TOKEN REVOCATION CHECK
            const [revoked] = await db.query("SELECT id FROM RevokedTokens WHERE token = ?", [token]);
            if (revoked.length > 0) {
                return res.status(401).json({ error: "This token has been revoked. Please log in again." });
            }

            // 2. VERIFY JWT
            const verified = jwt.verify(token, process.env.JWT_SECRET);

            // 3. API KEY SCOPING
            if (requiredScopes.length > 0) {
                const hasScope = requiredScopes.every(scope => verified.scopes.includes(scope));
                if (!hasScope) {
                    return res.status(403).json({ error: "Forbidden: You lack the required scope." });
                }
            }

            // 4. USAGE STATISTICS LOGGING
            db.query("INSERT INTO AccessLogs (user_id, endpoint) VALUES (?, ?)", [verified.id, req.originalUrl]).catch(console.error);

            req.user = verified;
            req.token = token; // Save token for revocation endpoint
            next();
        } catch (err) {
            res.status(403).json({ error: "Invalid or expired token." });
        }
    };
};

module.exports = verifyToken;