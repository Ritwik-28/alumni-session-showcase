import fetch from 'node-fetch';

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL;
const DIRECTUS_EMAIL = process.env.VITE_DIRECTUS_EMAIL;
const DIRECTUS_PASSWORD = process.env.VITE_DIRECTUS_PASSWORD;

export async function fetchDirectusToken() {
  try {
    if (!DIRECTUS_URL || !DIRECTUS_EMAIL || !DIRECTUS_PASSWORD) {
      throw new Error('Missing required environment variables: VITE_DIRECTUS_URL, VITE_DIRECTUS_EMAIL, or VITE_DIRECTUS_PASSWORD');
    }

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
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    const authData = await response.json();
    return authData.data.access_token;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new Error(`Failed to authenticate: ${error.message}`);
  }
}

// Optional endpoint to authenticate manually (if needed)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const token = await fetchDirectusToken();
      res.status(200).json({ access_token: token });
    } catch (error) {
      res.status(500).json({ error: `Failed to authenticate: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}