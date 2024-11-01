// server/authenticate.js

import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL;
const DIRECTUS_EMAIL = process.env.VITE_DIRECTUS_EMAIL;
const DIRECTUS_PASSWORD = process.env.VITE_DIRECTUS_PASSWORD;

router.post('/authenticate', async (req, res) => {
  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: DIRECTUS_EMAIL,
        password: DIRECTUS_PASSWORD,
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Authentication failed' });
    }

    const authData = await response.json();
    res.json(authData); // Send the token back to the frontend
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

export default router;