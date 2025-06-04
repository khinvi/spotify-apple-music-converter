import { SpotifyPlaylist, SpotifyTrack } from '../types';
import { spotifyAuth } from './spotifyAuth';

class SpotifyAPI {
  private baseUrl = 'https://api.spotify.com/v1';

  // Generic API request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await spotifyAuth.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be invalid, try to refresh
        await spotifyAuth.getAccessToken();
        // Retry request once
        return this.request(endpoint, options);
      }
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get user's playlists
  async getUserPlaylists(limit = 50, offset = 0): Promise<{
    items: SpotifyPlaylist[];
    total: number;
    next: string | null;
  }> {
    const data = await this.request<any>(
      `/me/playlists?limit=${limit}&offset=${offset}`
    );
    
    return {
      items: data.items,
      total: data.total,
      next: data.next,
    };
  }

  // Get all user playlists (handling pagination)
  async getAllUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const playlists: SpotifyPlaylist[] = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const { items, next } = await this.getUserPlaylists(limit, offset);
      playlists.push(...items);
      hasMore = next !== null;
      offset += limit;
    }

    return playlists;
  }

  // Get tracks from a playlist
  async getPlaylistTracks(
    playlistId: string, 
    limit = 100, 
    offset = 0
  ): Promise<{
    items: Array<{ track: SpotifyTrack }>;
    total: number;
    next: string | null;
  }> {
    const data = await this.request<any>(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,duration_ms,explicit,popularity,preview_url,external_ids,artists,album)),total,next`
    );

    return {
      items: data.items.filter((item: any) => item.track && item.track.id), // Filter out null tracks
      total: data.total,
      next: data.next,
    };
  }

  // Get all tracks from a playlist (handling pagination)
  async getAllPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const tracks: SpotifyTrack[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const { items, next } = await this.getPlaylistTracks(playlistId, limit, offset);
      tracks.push(...items.map(item => item.track));
      hasMore = next !== null;
      offset += limit;

      // Add a small delay to avoid rate limiting
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return tracks;
  }

  // Get multiple tracks by IDs (max 50 at a time)
  async getTracks(trackIds: string[]): Promise<SpotifyTrack[]> {
    if (trackIds.length === 0) return [];
    
    const chunks = [];
    for (let i = 0; i < trackIds.length; i += 50) {
      chunks.push(trackIds.slice(i, i + 50));
    }

    const allTracks: SpotifyTrack[] = [];
    
    for (const chunk of chunks) {
      const data = await this.request<{ tracks: SpotifyTrack[] }>(
        `/tracks?ids=${chunk.join(',')}`
      );
      allTracks.push(...data.tracks);
      
      // Small delay between requests
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }