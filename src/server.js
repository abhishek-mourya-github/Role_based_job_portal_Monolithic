require('dotenv').config();
const express = require('express');
const connectToDB = require('./database/db');
const cors = require('cors');
const adminRoutes = require('./routes/admin.routes');
const applicationRoutes = require('./routes/application.routes');
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectToDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 