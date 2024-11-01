// services/directus.ts
import type { AlumniSession } from '../types';

const DIRECTUS_BASE_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://directus.crio.do';

export class DirectusService {
  private static token: string | null = null;
  private static tokenExpiry: number | null = null;
  private static refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Authenticate by calling the backend endpoint
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

  // Schedule a token refresh a few seconds before it expires
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

  // Fetch data with the authorization token using the serverless function
  private static async fetchWithAuth<T>(endpoint: string): Promise<T> {
    await this.ensureValidToken();

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might have expired; retry after clearing token
          this.token = null;
          this.tokenExpiry = null;
          return this.fetchWithAuth(endpoint);
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Fetch published alumni sessions by calling the serverless function
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

  // Utility methods for direct asset URLs
  static getAssetUrl(fileId: string): string {
    return `${DIRECTUS_BASE_URL}/assets/${fileId}`;
  }

  static getAssetDownloadUrl(fileId: string): string {
    return `${DIRECTUS_BASE_URL}/assets/${fileId}?download=true`;
  }
}