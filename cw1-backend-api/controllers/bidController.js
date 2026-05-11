const db = require('../config/db');

// POST /api/bids - Place a new bid
exports.placeBid = async (req, res) => {
    const { bid_amount } = req.body;
    const userId = req.user.id;

    try {
        // 1. Enforce Monthly Limit (Max 3 bids per month)
        const [monthlyBids] = await db.query(
            "SELECT COUNT(*) as count FROM Bids WHERE user_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())",
            [userId]
        );
        
        if (monthlyBids[0].count >= 3) {
            return res.status(403).json({ error: "Monthly limit of 3 bids reached." });
        }

        // 2. Enforce "Increase Only" Rule
        const [lastBid] = await db.query(
            "SELECT bid_amount FROM Bids WHERE user_id = ? ORDER BY bid_amount DESC LIMIT 1",
            [userId]
        );

        if (lastBid.length > 0 && parseFloat(bid_amount) <= parseFloat(lastBid[0].bid_amount)) {
            return res.status(400).json({ error: "Your new bid must be higher than your previous highest bid." });
        }

        // 3. Place the Blind Bid
        // Notice: We do NOT send the current highest bid back to the user, keeping it strictly "blind".
        await db.query(
            "INSERT INTO Bids (user_id, bid_amount, status) VALUES (?, ?, 'pending')",
            [userId, bid_amount]
        );

        res.status(201).json({ message: "Bid securely placed. Good luck!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error placing bid." });
    }
};

// GET /api/bids/me - View win/lose status feedback
exports.getMyBids = async (req, res) => {
    const userId = req.user.id;
    try {
        // Users can only see THEIR OWN bids and statuses.
        const [bids] = await db.query(
            "SELECT bid_amount, status, created_at FROM Bids WHERE user_id = ? ORDER BY created_at DESC", 
            [userId]
        );
        res.json(bids);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching bids." });
    }
};