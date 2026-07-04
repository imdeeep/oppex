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
      sameSite: 'lax',
      secure: config.isProduction,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

module.exports = { createSessionMiddleware };
