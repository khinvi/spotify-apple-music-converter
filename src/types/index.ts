// Spotify Types
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    total: number;
    href: string;
  };
  owner: {
    id: string;
    display_name: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  external_ids?: {
    isrc?: string;
  };
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    release_date: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

// Apple Music Types
export interface AppleTrack {
  id: string;
  type: 'songs';
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    isrc?: string;
    previews: Array<{
      url: string;
    }>;
    artwork: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export interface ApplePlaylist {
  id: string;
  type: 'library-playlists';
  attributes: {
    name: string;
    description?: {
      standard: string;
    };
    dateAdded: string;
  };
}

// Application Types
export interface ConversionResult {
  spotifyTrack: SpotifyTrack;
  appleTrack?: AppleTrack;
  status: 'success' | 'failed' | 'partial';
  confidence?: number;
  error?: string;
}

export interface ConversionProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  currentTrack?: string;
  status: 'idle' | 'converting' | 'completed' | 'error';
}

export interface AuthState {
  spotify: {
    isAuthenticated: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user?: SpotifyUser;
  };
  apple: {
    isAuthenticated: boolean;
    musicUserToken?: string;
    user?: any;
  };
}

export interface MatchStrategy {
  name: string;
  confidence: number;
  execute: (track: SpotifyTrack) => Promise<AppleTrack | null>;
}