const session = require('express-session');
const config = require('../config');

function createSessionMiddleware() {
  return session({
    name: 'oppex.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Cross-site (Amplify frontend → EC2 BFF) needs SameSite=None + Secure.
      // Local dev stays on Lax over http.
      sameSite: config.isProduction ? 'none' : 'lax',
      secure: config.isProduction,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

module.exports = { createSessionMiddleware };
