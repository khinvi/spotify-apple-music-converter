import { SpotifyUser } from '../types';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || window.location.origin + '/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

// PKCE helpers
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

class SpotifyAuth {
  private codeVerifier: string = '';
  private accessToken: string = '';
  private refreshToken: string = '';
  private tokenExpiresAt: number = 0;

  // Initiate OAuth flow with PKCE
  async authorize(): Promise<void> {
    this.codeVerifier = generateRandomString(128);
    const hashed = await sha256(this.codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Store code verifier for later use
    sessionStorage.setItem('spotify_code_verifier', this.codeVerifier);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    const params = {
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }

  // Handle OAuth callback
  async handleCallback(code: string): Promise<boolean> {
    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      this.setTokens(data);
      
      // Clean up
      sessionStorage.removeItem('spotify_code_verifier');
      
      return true;
    } catch (error) {
      console.error('Token exchange failed:', error);
      return false;
    }
  }

  // Store tokens
  private setTokens(data: any): void {
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    // Store in session storage for persistence during session
    sessionStorage.setItem('spotify_access_token', this.accessToken);
    sessionStorage.setItem('spotify_refresh_token', this.refreshToken);
    sessionStorage.setItem('spotify_token_expires_at', this.tokenExpiresAt.toString());
  }

  // Get current access token, refreshing if needed
  async getAccessToken(): Promise<string> {
    // Check session storage first
    if (!this.accessToken) {
      this.accessToken = sessionStorage.getItem('spotify_access_token') || '';
      this.refreshToken = sessionStorage.getItem('spotify_refresh_token') || '';
      this.tokenExpiresAt = parseInt(sessionStorage.getItem('spotify_token_expires_at') || '0');
    }

    // Check if token is expired or about to expire (5 min buffer)
    if (this.tokenExpiresAt - Date.now() < 300000) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setTokens(data);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and require re-authentication
      this.logout();
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<SpotifyUser> {
    const token = await this.getAccessToken();
    
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('spotify_access_token');
    const expiresAt = parseInt(sessionStorage.getItem('spotify_token_expires_at') || '0');
    return !!token && expiresAt > Date.now();
  }

  // Logout
  logout(): void {
    this.accessToken = '';
    this.refreshToken = '';
    this.tokenExpiresAt = 0;
    
    sessionStorage.removeItem('spotify_access_token');
    sessionStorage.removeItem('spotify_refresh_token');
    sessionStorage.removeItem('spotify_token_expires_at');
    sessionStorage.removeItem('spotify_code_verifier');
  }
}

export const spotifyAuth = new SpotifyAuth();