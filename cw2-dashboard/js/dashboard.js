document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'index.html'; return; }

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 1. Chart Variables
    let pieChartInstance = null;
    let barChartInstance = null;
    let doghnutInstance = null;
    let radarInstance = null;
    let lineInstance = null;
    let geoInstance = null;

    let filtersPopulated = false;

    // --- FETCH DATA FUNCTIONS ---
    async function loadAnalytics() {
        try {
            const prog = document.getElementById('filterProg').value;
            const year = document.getElementById('filterDate').value;

            const res = await fetch(`http://localhost:5000/api/analytics/dashboard-data?prog=${prog}&year=${year}`, { headers });
            if (!res.ok) throw new Error("Failed to load analytics");
            const data = await res.json();

            if (!filtersPopulated) {
                const progSelect = document.getElementById('filterProg');
                data.filters.programmes.forEach(p => { progSelect.innerHTML += `<option value="${p}">${p}</option>`; });
                const yearSelect = document.getElementById('filterDate');
                data.filters.years.forEach(y => { yearSelect.innerHTML += `<option value="${y}">${y}</option>`; });
                filtersPopulated = true;
            }

            renderCharts(data);
        } catch (err) { console.error(err); }
    }

    async function loadBidStatus() {
        try {
            const res = await fetch('http://localhost:5000/api/bids/me', { headers });
            const bids = await res.json();
            const badge = document.getElementById('bidStatusBadge');

            if (bids.length > 0) {
                badge.textContent = `${bids[0].status.toUpperCase()} (£${bids[0].bid_amount})`;
                badge.style.color = bids[0].status === 'won' ? '#10b981' : '#f59e0b';
            } else { badge.textContent = "No bids placed yet."; }
        } catch (err) { console.error(err); }
    }

    async function loadUsageLogs() {
        try {
            const res = await fetch('http://localhost:5000/api/auth/usage-stats', { headers });
            const logs = await res.json();
            const tbody = document.getElementById('usageLogs');
            tbody.innerHTML = logs.map(log => `<tr><td><code>${log.endpoint}</code></td><td>${new Date(log.accessed_at).toLocaleString()}</td></tr>`).join('');
        } catch (err) { console.error(err); }
    }

    // --- RENDER CHARTS FUNCTION ---
    function renderCharts(data) {
        const commonOptions = { maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f8fafc' } } } };

        // 🌟 SMART FALLBACKS: If the database sends an empty array, inject "Awaiting Data" so the chart never goes invisible!
        const empData = data.employmentByRole?.length ? data.employmentByRole : [{ role: 'Awaiting Data', count: 1 }];
        const eduData = data.educationDistribution?.length ? data.educationDistribution : [{ degree: 'Awaiting Data', count: 1 }];
        const growthData = data.alumniGrowth?.length ? data.alumniGrowth : [{ year: 'No Data', count: 0 }];
        const employerData = data.topEmployers?.length ? data.topEmployers : [{ company: 'Awaiting Data', count: 1 }];
        const locData = data.globalLocations?.length ? data.globalLocations : [{ location: 'Awaiting Data', count: 1 }];

        // 1. Pie Chart (Roles)
        try {
            if (pieChartInstance) pieChartInstance.destroy();
            pieChartInstance = new Chart(document.getElementById('pieChart'), {
                type: 'pie',
                data: { labels: empData.map(d => d.role), datasets: [{ data: empData.map(d => d.count), backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#475569'] }] },
                options: commonOptions
            });
        } catch (err) { console.error(err); }

        // 2. Bar Chart (Degrees)
        try {
            if (barChartInstance) barChartInstance.destroy();
            barChartInstance = new Chart(document.getElementById('barChart'), {
                type: 'bar',
                data: { labels: eduData.map(d => d.degree), datasets: [{ label: 'Graduates', data: eduData.map(d => d.count), backgroundColor: '#10b981' }] },
                options: { ...commonOptions, scales: { y: { ticks: { color: 'white', stepSize: 1 } }, x: { ticks: { color: 'white' } } }, plugins: { legend: { display: false } } }
            });
        } catch (err) { console.error(err); }

        // 3. Line Chart (Growth)
        try {
            if (lineInstance) lineInstance.destroy();
            lineInstance = new Chart(document.getElementById('lineChart'), {
                type: 'line',
                data: { labels: growthData.map(d => d.year), datasets: [{ label: 'Total Graduates', data: growthData.map(d => d.count), borderColor: '#10b981', tension: 0.3, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.2)' }] },
                options: { ...commonOptions, scales: { y: { ticks: { color: 'white', stepSize: 1 } }, x: { ticks: { color: 'white' } } } }
            });
        } catch (err) { console.error(err); }

        // 4. Doughnut Chart (Employers)
        try {
            if (doghnutInstance) doghnutInstance.destroy();
            doghnutInstance = new Chart(document.getElementById('doughnutChart'), {
                type: 'doughnut',
                data: { labels: employerData.map(d => d.company), datasets: [{ data: employerData.map(d => d.count), backgroundColor: ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#475569'] }] },
                options: commonOptions
            });
        } catch (err) { console.error(err); }

        // 5. Radar Chart (Skills Gap - Guaranteed to render)
        try {
            if (radarInstance) radarInstance.destroy();
            radarInstance = new Chart(document.getElementById('radarChart'), {
                type: 'radar',
                data: {
                    labels: ['Algorithms', 'Cloud', 'Agile', 'CI/CD', 'System Design'],
                    datasets: [
                        { label: 'Taught', data: [90, 50, 70, 60, 65], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                        { label: 'Required', data: [80, 85, 80, 90, 85], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                    ]
                },
                options: { ...commonOptions, scales: { r: { ticks: { display: false }, pointLabels: { color: '#94a3b8' } } } }
            });
        } catch (err) { console.error(err); }

        // 6. Geo Chart (Locations)
        try {
            if (geoInstance) geoInstance.destroy();
            geoInstance = new Chart(document.getElementById('geoChart'), {
                type: 'bar',
                data: { labels: locData.map(d => d.location), datasets: [{ label: 'Alumni', data: locData.map(d => d.count), backgroundColor: '#a855f7' }] },
                options: { ...commonOptions, indexAxis: 'y', scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white', stepSize: 1 } } } }
            });
        } catch (err) { console.error(err); }
    }

    // --- EVENT LISTENERS ---
    document.getElementById('applyFiltersBtn').addEventListener('click', loadAnalytics);

    document.getElementById('placeBidBtn').addEventListener('click', async () => {
        const amount = document.getElementById('bidAmount').value;
        if (!amount) return alert("Enter a bid amount");

        const res = await fetch('http://localhost:5000/api/bids', { method: 'POST', headers, body: JSON.stringify({ bid_amount: amount }) });
        const result = await res.json();
        alert(res.ok ? "Success: " + result.message : "Error: " + result.error);
        loadBidStatus();
        document.getElementById('bidAmount').value = '';
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('http://localhost:5000/api/auth/revoke', { method: 'POST', headers });
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Initialize Dashboard
    loadAnalytics();
    loadBidStatus();
    loadUsageLogs();
});