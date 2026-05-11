const db = require('../config/db');

exports.getFeaturedAlumnus = async (req, res) => {
    try {
        // Fetch the profile that has won the most bids
        const [featured] = await db.query(`
            SELECT p.bio, p.linkedin_url, p.degrees, p.employment, u.email 
            FROM Profiles p 
            JOIN Users u ON p.user_id = u.id 
            ORDER BY p.appearance_count DESC 
            LIMIT 1
        `);

        if (featured.length === 0) {
            return res.status(404).json({ message: "No featured alumnus today." });
        }

        // Format for public viewing (parsing JSON strings back to objects)
        const alumnus = featured[0];
        res.json({
            featured_alumnus: {
                contact: alumnus.email,
                bio: alumnus.bio,
                linkedin: alumnus.linkedin_url,
                degrees: typeof alumnus.degrees === 'string' ? JSON.parse(alumnus.degrees) : alumnus.degrees,
                current_role: typeof alumnus.employment === 'string' ? JSON.parse(alumnus.employment)[0] : alumnus.employment[0]
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching public data." });
    }
};