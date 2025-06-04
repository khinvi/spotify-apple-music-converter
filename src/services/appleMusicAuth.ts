declare global {
  interface Window {
    MusicKit: any;
  }
}

class AppleMusicAuth {
  private musicKitInstance: any = null;
  private isConfigured = false;

  // Initialize MusicKit
  async configure(): Promise<void> {
    if (this.isConfigured) return;

    // Wait for MusicKit to load
    await this.waitForMusicKit();

    try {
      // In production, you'll need to generate this token server-side
      // For development, you can use a temporary token
      const developerToken = process.env.REACT_APP_APPLE_MUSIC_TOKEN || '';

      if (!developerToken) {
        throw new Error('Apple Music developer token not configured');
      }

      await window.MusicKit.configure({
        developerToken,
        app: {
          name: 'Spotify to Apple Music Converter',
          build: '1.0.0',
        },
      });

      this.musicKitInstance = window.MusicKit.getInstance();
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to configure MusicKit:', error);
      throw error;
    }
  }

  // Wait for MusicKit JS to load
  private waitForMusicKit(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.MusicKit) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 5 seconds timeout

      const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.MusicKit) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('MusicKit failed to load'));
        }
      }, 100);
    });
  }

  // Authorize user
  async authorize(): Promise<string> {
    if (!this.isConfigured) {
      await this.configure();
    }

    try {
      const musicUserToken = await this.musicKitInstance.authorize();
      
      // Store token in session
      sessionStorage.setItem('apple_music_user_token', musicUserToken);
      
      return musicUserToken;
    } catch (error) {
      console.error('Apple Music authorization failed:', error);
      throw error;
    }
  }

  // Check if user is authorized
  isAuthorized(): boolean {
    if (!this.musicKitInstance) return false;
    
    const token = sessionStorage.getItem('apple_music_user_token');
    return this.musicKitInstance.isAuthorized || !!token;
  }

  // Get music user token
  getMusicUserToken(): string | null {
    if (this.musicKitInstance && this.musicKitInstance.musicUserToken) {
      return this.musicKitInstance.musicUserToken;
    }
    
    return sessionStorage.getItem('apple_music_user_token');
  }

  // Get MusicKit instance
  getMusicKit(): any {
    if (!this.musicKitInstance) {
      throw new Error('MusicKit not initialized');
    }
    return this.musicKitInstance;
  }

  // Unauthorize (logout)
  unauthorize(): void {
    if (this.musicKitInstance) {
      this.musicKitInstance.unauthorize();
    }
    
    sessionStorage.removeItem('apple_music_user_token');
  }

  // Load MusicKit JS script
  static loadMusicKitScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.getElementById('musickit-js')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'musickit-js';
      script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MusicKit JS'));

      document.head.appendChild(script);
    });
  }
}

export const appleMusicAuth = new AppleMusicAuth();