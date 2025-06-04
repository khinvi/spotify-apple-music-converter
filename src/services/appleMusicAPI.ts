import { AppleTrack, ApplePlaylist } from '../types';
import { appleMusicAuth } from './appleMusicAuth';

class AppleMusicAPI {
  private baseUrl = 'https://api.music.apple.com/v1';
  
  // Get user's storefront (region)
  private async getUserStorefront(): Promise<string> {
    // Try to get from session storage first
    const cached = sessionStorage.getItem('apple_music_storefront');
    if (cached) return cached;

    const musicKit = appleMusicAuth.getMusicKit();
    const storefronts = await musicKit.api.music('/v1/me/storefront');
    
    if (storefronts.data && storefronts.data.length > 0) {
      const storefront = storefronts.data[0].id;
      sessionStorage.setItem('apple_music_storefront', storefront);
      return storefront;
    }
    
    // Default to US if can't determine
    return 'us';
  }

  // Search for tracks
  async searchTracks(query: string, limit = 25): Promise<AppleTrack[]> {
    const musicKit = appleMusicAuth.getMusicKit();
    const storefront = await this.getUserStorefront();
    
    try {
      const results = await musicKit.api.music(
        `/v1/catalog/${storefront}/search`,
        {
          term: query,
          types: 'songs',
          limit: limit.toString(),
        }
      );

      return results.data.results.songs?.data || [];
    } catch (error) {
      console.error('Apple Music search error:', error);
      return [];
    }
  }

  // Search by ISRC
  async searchByISRC(isrc: string): Promise<AppleTrack | null> {
    const tracks = await this.searchTracks(isrc, 1);
    
    // Verify ISRC match
    if (tracks.length > 0 && tracks[0].attributes.isrc === isrc) {
      return tracks[0];
    }
    
    return null;
  }

  // Create a new playlist
  async createPlaylist(name: string, description?: string): Promise<ApplePlaylist> {
    const musicKit = appleMusicAuth.getMusicKit();
    
    const playlistData = {
      attributes: {
        name,
        description: description ? { standard: description } : undefined,
      },
    };

    try {
      const response = await musicKit.api.music(
        '/v1/me/library/playlists',
        {
          method: 'POST',
          body: {
            data: [playlistData],
          },
        }
      );

      return response.data.data[0];
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  }

  // Add tracks to playlist
  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    const musicKit = appleMusicAuth.getMusicKit();
    
    // Apple Music API requires tracks to be added in batches
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < trackIds.length; i += batchSize) {
      batches.push(trackIds.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const tracks = batch.map(id => ({
        id,
        type: 'songs',
      }));

      try {
        await musicKit.api.music(
          `/v1/me/library/playlists/${playlistId}/tracks`,
          {
            method: 'POST',
            body: {
              data: tracks,
            },
          }
        );

        // Small delay between batches
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error('Failed to add tracks to playlist:', error);
        throw error;
      }
    }
  }

  // Get user's library playlists
  async getUserPlaylists(limit = 100): Promise<ApplePlaylist[]> {
    const musicKit = appleMusicAuth.getMusicKit();
    
    try {
      const response = await musicKit.api.music(
        '/v1/me/library/playlists',
        { limit: limit.toString() }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      return [];
    }
  }

  // Add track to library
  async addTrackToLibrary(trackId: string): Promise<void> {
    const musicKit = appleMusicAuth.getMusicKit();
    
    try {
      await musicKit.api.music(
        '/v1/me/library',
        {
          method: 'POST',
          body: {
            data: [{
              id: trackId,
              type: 'songs',
            }],
          },
        }
      );
    } catch (error) {
      console.error('Failed to add track to library:', error);
      throw error;
    }
  }

  // Get track details by ID
  async getTrack(trackId: string): Promise<AppleTrack | null> {
    const musicKit = appleMusicAuth.getMusicKit();
    const storefront = await this.getUserStorefront();
    
    try {
      const response = await musicKit.api.music(
        `/v1/catalog/${storefront}/songs/${trackId}`
      );

      return response.data.data[0] || null;
    } catch (error) {
      console.error('Failed to fetch track:', error);
      return null;
    }
  }
}

export const appleMusicApi = new AppleMusicAPI();