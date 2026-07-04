const config = require('../config');

class QuarkusError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'QuarkusError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${config.quarkusUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!response.ok) {
    throw new QuarkusError(
      response.status,
      body?.message || `Quarkus request failed (${response.status})`
    );
  }

  return body;
}

function signup(email, password) {
  return request('/api/users/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

function verifyOtp(email, otp) {
  return request('/api/users/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

function resendCode(email) {
  return request('/api/users/resend-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

function login(email, password) {
  return request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

module.exports = {
  QuarkusError,
  signup,
  verifyOtp,
  resendCode,
  login,
};
