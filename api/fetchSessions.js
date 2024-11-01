// api/fetchSessions.js
import fetch from 'node-fetch';
import { fetchDirectusToken, getDirectusToken } from './authenticate.js';

const DIRECTUS_URL = process.env.DIRECTUS_URL;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let token = getDirectusToken();

      // If there's no token, or if the token is expired, fetch a new one
      if (!token) {
        token = await fetchDirectusToken();
      }

      const response = await fetch(`${DIRECTUS_URL}/items/alumni_session?filter[status][_eq]=published&limit=-1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch data from Directus: ${response.statusText}`);
        return res.status(response.status).json({ error: 'Failed to fetch data from Directus' });
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}