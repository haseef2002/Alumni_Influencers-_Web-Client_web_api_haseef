const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        const { prog, year } = req.query;
        // 1. We ask the database for the new current_location column
        const [profiles] = await db.query("SELECT degrees, employment, current_location FROM Profiles");

        let roles = {};
        let degreesCount = {};
        let yearGrowth = {};
        let employers = {};
        let locations = {}; // <--- THIS WAS MISSING! We must declare the bucket before we fill it.

        let availableProgrammes = new Set();
        let availableYears = new Set();

        profiles.forEach(profile => {
            const empList = typeof profile.employment === 'string' ? JSON.parse(profile.employment) : (profile.employment || []);
            const degList = typeof profile.degrees === 'string' ? JSON.parse(profile.degrees) : (profile.degrees || []);

            // Find unique programmes and years for the dropdown filters
            degList.forEach(d => {
                if (d.name) availableProgrammes.add(d.name);
                if (d.completion_date) {
                    const gradYear = d.completion_date.substring(0, 4);
                    availableYears.add(gradYear);
                }
            });

            // Apply Filters based on dropdown selection
            let matchesProg = !prog || prog === 'all' || degList.some(d => d.name && d.name.toLowerCase().includes(prog.toLowerCase()));
            let matchesYear = !year || year === 'all' || degList.some(d => d.completion_date && d.completion_date.startsWith(year));

            // Calculate all chart data
            if (matchesProg && matchesYear) {
                empList.forEach(e => {
                    if (e.role) roles[e.role] = (roles[e.role] || 0) + 1;
                    if (e.company) employers[e.company] = (employers[e.company] || 0) + 1;
                });

                degList.forEach(d => {
                    if (d.name) degreesCount[d.name] = (degreesCount[d.name] || 0) + 1;
                    if (d.completion_date) {
                        const gradYear = d.completion_date.substring(0, 4);
                        yearGrowth[gradYear] = (yearGrowth[gradYear] || 0) + 1;
                    }
                });

                // Fill the locations bucket safely!
                let loc = profile.current_location || 'Not Specified';
                locations[loc] = (locations[loc] || 0) + 1;
            }
        });

        res.json({
            // REAL Data for Charts
            employmentByRole: Object.keys(roles).map(k => ({ role: k, count: roles[k] })),
            educationDistribution: Object.keys(degreesCount).map(k => ({ degree: k, count: degreesCount[k] })),
            alumniGrowth: Object.keys(yearGrowth).sort().map(k => ({ year: k, count: yearGrowth[k] })),
            topEmployers: Object.keys(employers).sort((a, b) => employers[b] - employers[a]).slice(0, 5).map(k => ({ company: k, count: employers[k] })),
            globalLocations: Object.keys(locations).sort((a, b) => locations[b] - locations[a]).slice(0, 5).map(k => ({ location: k, count: locations[k] })),

            // Filters for the Dropdowns
            filters: {
                programmes: Array.from(availableProgrammes).sort(),
                years: Array.from(availableYears).sort().reverse()
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching analytics data." });
    }
};