import fetch from 'node-fetch';
import { fetchDirectusToken } from './authenticate.js';

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (!DIRECTUS_URL) {
        throw new Error('Missing VITE_DIRECTUS_URL environment variable');
      }

      // Fetch a new token for each request
      const token = await fetchDirectusToken();

      const response = await fetch(`${DIRECTUS_URL}/items/alumni_session?filter[status][_eq]=published&limit=-1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch data from Directus: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ error: `Failed to fetch data from Directus: ${response.statusText}` });
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching sessions:', error.message);
      res.status(500).json({ error: `Failed to fetch sessions: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}