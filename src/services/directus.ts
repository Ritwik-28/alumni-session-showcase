import type { AlumniSession, DirectusResponse } from '../types';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

interface AuthResponse {
  data: {
    access_token: string;
    expires: number;
  };
}

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

      const auth = (await response.json()) as AuthResponse;
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

  // Fetch data with the authorization token
  private static async fetchWithAuth<T>(endpoint: string): Promise<T> {
    await this.ensureValidToken();

    try {
      const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
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

  // Utility methods for asset URLs
  static getAssetUrl(fileId: string): string {
    return `${DIRECTUS_URL}/assets/${fileId}`;
  }

  static getAssetDownloadUrl(fileId: string): string {
    return `${DIRECTUS_URL}/assets/${fileId}?download`;
  }

  // Fetch published alumni sessions from the Directus collection
  static async getSessions(): Promise<AlumniSession[]> {
    try {
      const response = await this.fetchWithAuth<DirectusResponse<AlumniSession>>(
        `/items/alumni_session?filter[status][_eq]=published&limit=-1`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch alumni sessions');
    }
  }
}