import type { AlumniSession, DirectusResponse } from '../types';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;
const COLLECTION_NAME = import.meta.env.VITE_COLLECTION_NAME;

interface AuthResponse {
  data: {
    access_token: string;
    expires: number;
  };
}

export class DirectusService {
  private static token: string | null = null;
  private static tokenExpiry: number | null = null;

  private static async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: import.meta.env.VITE_DIRECTUS_EMAIL,
          password: import.meta.env.VITE_DIRECTUS_PASSWORD,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const auth = (await response.json()) as AuthResponse;
      this.token = auth.data.access_token;
      this.tokenExpiry = Date.now() + auth.data.expires;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate');
    }
  }

  private static async ensureValidToken(): Promise<void> {
    if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

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

  static getAssetUrl(fileId: string): string {
    return `${DIRECTUS_URL}/assets/${fileId}`;
  }

  static getAssetDownloadUrl(fileId: string): string {
    return `${DIRECTUS_URL}/assets/${fileId}?download`;
  }

  static async getSessions(): Promise<AlumniSession[]> {
    try {
      const response = await this.fetchWithAuth<DirectusResponse<AlumniSession>>(
        `/items/${COLLECTION_NAME}?filter[status][_eq]=published&limit=-1`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch alumni sessions');
    }
  }
}