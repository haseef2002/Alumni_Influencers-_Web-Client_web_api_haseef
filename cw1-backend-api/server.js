require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. Import Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const bidRoutes = require('./routes/bidRoutes');
require('./services/cronService'); // This starts the background timer!
const analyticsRoutes = require('./routes/analyticsRoutes');
const publicRoutes = require('./routes/publicRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Swagger API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 2. Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/public', publicRoutes); // New Public Route mapped!
//3.analytic routes
app.use('/api/analytics', analyticsRoutes);
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running securely on port ${PORT}`);
});