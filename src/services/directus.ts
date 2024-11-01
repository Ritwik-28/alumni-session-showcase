// services/directus.ts
import type { AlumniSession } from '../types';

const DIRECTUS_BASE_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://directus.crio.do';

export class DirectusService {
  private static token: string | null = null;
  private static tokenExpiry: number | null = null;
  private static refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Method to authenticate and retrieve a token
  private static async authenticate(): Promise<void> {
    try {
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const auth = await response.json();
      this.token = auth.data.access_token;
      this.tokenExpiry = Date.now() + auth.data.expires * 1000;
      this.scheduleTokenRefresh(auth.data.expires);
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate');
    }
  }

  // Schedule token refresh before it expires
  private static scheduleTokenRefresh(expiresIn: number): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }
    const refreshTime = (expiresIn - 10) * 1000; // Refresh 10 seconds before expiry
    this.refreshTimeoutId = setTimeout(() => this.authenticate(), refreshTime);
  }

  // Ensure the token is valid; re-authenticate if necessary
  private static async ensureValidToken(): Promise<void> {
    if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  // Fetch an asset URL with the token
  static async getAssetUrl(fileId: string): Promise<string> {
    await this.ensureValidToken();
    return `${DIRECTUS_BASE_URL}/assets/${fileId}?access_token=${this.token}`;
  }

  // Fetch an asset download URL with the token
  static async getAssetDownloadUrl(fileId: string): Promise<string> {
    await this.ensureValidToken();
    return `${DIRECTUS_BASE_URL}/assets/${fileId}?download=true&access_token=${this.token}`;
  }

  // Fetch published alumni sessions by calling a serverless function
  static async getSessions(): Promise<AlumniSession[]> {
    try {
      const response = await fetch('/api/fetchSessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alumni sessions');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch alumni sessions');
    }
  }
}