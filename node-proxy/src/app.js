const express = require('express');
const cors = require('cors');
const config = require('./config');
const { createSessionMiddleware } = require('./middleware/session');
const authRoutes = require('./routes/authRoutes');

function createApp() {
  const app = express();

  // Behind a TLS-terminating reverse proxy (Caddy/Nginx). Lets express-session
  // trust X-Forwarded-Proto so Secure cookies are set over the HTTPS chain.
  app.set('trust proxy', 1);

  // Normalize /auth/login/ → /auth/login (Amplify may append trailing slashes).
  app.use((req, _res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) {
      const query = req.url.slice(req.path.length);
      req.url = req.path.slice(0, -1) + query;
    }
    next();
  });

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
