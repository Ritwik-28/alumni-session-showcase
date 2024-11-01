// server/server.js

import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import authenticateRoute from './authenticate.js';

dotenv.config(); // Load environment variables from .env

const app = express();
app.use(express.json());
app.use('/api', authenticateRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});