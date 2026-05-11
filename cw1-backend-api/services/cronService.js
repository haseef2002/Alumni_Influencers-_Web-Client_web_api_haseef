const cron = require('node-cron');
const db = require('../config/db');

// Schedule: Runs at 00:00 (Midnight) every single day
cron.schedule('0 0 * * *', async () => {
    console.log("--- Executing Midnight Winner Selection ---");
    
    try {
        // 1. Find the absolute highest pending bid
        const [winner] = await db.query(
            "SELECT id, user_id FROM Bids WHERE status = 'pending' ORDER BY bid_amount DESC LIMIT 1"
        );

        if (winner.length > 0) {
            const winnerId = winner[0].id;
            const winnerUserId = winner[0].user_id;

            // 2. Mark the highest bidder as 'won'
            await db.query("UPDATE Bids SET status = 'won' WHERE id = ?", [winnerId]);
            
            // 3. Mark all other pending bids as 'lost'
            await db.query("UPDATE Bids SET status = 'lost' WHERE status = 'pending'");
            
            // 4. Update the winning Profile's appearance count (Marking it to be displayed)
            await db.query("UPDATE Profiles SET appearance_count = appearance_count + 1 WHERE user_id = ?", [winnerUserId]);
            
            console.log(`Success: User ${winnerUserId} won the daily feature!`);
        } else {
            console.log("No pending bids found for today.");
        }
    } catch (err) {
        console.error("Cron Error:", err);
    }
});