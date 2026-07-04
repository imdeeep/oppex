const express = require('express');
const cors = require('cors');
const config = require('./config');
const { createSessionMiddleware } = require('./middleware/session');
const authRoutes = require('./routes/authRoutes');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (config.isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(createSessionMiddleware());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);

  return app;
}

module.exports = { createApp };
