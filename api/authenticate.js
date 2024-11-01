// api/authenticate.js
import fetch from 'node-fetch';

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL;
const DIRECTUS_EMAIL = process.env.VITE_DIRECTUS_EMAIL;
const DIRECTUS_PASSWORD = process.env.VITE_DIRECTUS_PASSWORD;

let directusToken = null; // Variable to store the token

// Function to fetch and set the token
export async function fetchDirectusToken() {
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
      throw new Error('Authentication failed');
    }

    const authData = await response.json();
    directusToken = authData.data.access_token;
    return directusToken;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Failed to authenticate');
  }
}

// Endpoint to authenticate and retrieve a token (optional)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const token = await fetchDirectusToken();
      res.status(200).json({ access_token: token });
    } catch (error) {
      res.status(500).json({ error: 'Failed to authenticate' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Export the token for use in other functions
export function getDirectusToken() {
  return directusToken;
}