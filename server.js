const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Import route modules
const usersRouter = require('./routes/userRoutes');
const notificationsRouter = require('./routes/notificationRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');

// Mount API routes
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server if not running as serverless function
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please stop the existing process or change PORT in .env.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

module.exports = app;
