const express = require('express');
const quarkusClient = require('../clients/quarkusClient');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await quarkusClient.signup(email, password);
    res.status(201).json(user);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await quarkusClient.verifyOtp(email, otp);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await quarkusClient.resendCode(email);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await quarkusClient.login(email, password);

    if (result.verified) {
      req.session.user = {
        id: result.id,
        email: result.email,
        verified: result.verified,
      };
    } else {
      req.session.user = null;
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('oppex.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.session.user);
});

function handleError(res, error) {
  if (error.name === 'QuarkusError') {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
}

module.exports = router;
