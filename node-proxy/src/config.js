require('dotenv').config();

const defaultClientUrl = 'http://localhost:5173';

const clientUrls = (process.env.CLIENT_URL || defaultClientUrl)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const config = {
  port: Number(process.env.PORT) || 3000,
  quarkusUrl: process.env.QUARKUS_URL || 'http://localhost:8080',
  sessionSecret: process.env.SESSION_SECRET || 'dev-only-change-in-production',
  clientUrl: clientUrls[0] || defaultClientUrl,
  clientUrls,
  isProduction: process.env.NODE_ENV === 'production',
};

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (config.clientUrls.includes(origin)) {
    return true;
  }

  if (!config.isProduction && /^http:\/\/localhost:\d+$/.test(origin)) {
    return true;
  }

  return false;
}

module.exports = { ...config, isAllowedOrigin };
