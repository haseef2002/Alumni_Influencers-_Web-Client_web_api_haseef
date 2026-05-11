const db = require('../config/db');

// GET /api/profiles/me
exports.getProfile = async (req, res) => {
    try {
        const [profile] = await db.query("SELECT * FROM Profiles WHERE user_id = ?", [req.user.id]);
        
        if (profile.length === 0) {
            return res.status(404).json({ message: "Profile not found. Please create one." });
        }
        res.json(profile[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching profile." });
    }
};

// POST /api/profiles/me (Creates or Updates the profile)
exports.upsertProfile = async (req, res) => {
    const userId = req.user.id;
    //expect current_location from the frontend
    const { bio, linkedin_url, current_location, degrees, certifications, licences, courses, employment } = req.body;

    try {
        const [existing] = await db.query("SELECT id FROM Profiles WHERE user_id = ?", [userId]);

        if (existing.length > 0) {
            // Update existing profile
            await db.query(
                `UPDATE Profiles SET 
                bio = ?, linkedin_url = ?, current_location = ?, degrees = ?, certifications = ?, licences = ?, courses = ?, employment = ? 
                WHERE user_id = ?`,
                [
                    bio, linkedin_url, current_location, 
                    JSON.stringify(degrees || []), JSON.stringify(certifications || []), 
                    JSON.stringify(licences || []), JSON.stringify(courses || []), 
                    JSON.stringify(employment || []), userId
                ]
            );
            res.json({ message: "Profile updated successfully." });
        } else {
            // Create new profile
            await db.query(
                `INSERT INTO Profiles (user_id, bio, linkedin_url, current_location, degrees, certifications, licences, courses, employment) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, bio, linkedin_url, current_location,
                    JSON.stringify(degrees || []), JSON.stringify(certifications || []), 
                    JSON.stringify(licences || []), JSON.stringify(courses || []), 
                    JSON.stringify(employment || [])
                ]
            );
            res.status(201).json({ message: "Profile created successfully." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error saving profile." });
    }
};