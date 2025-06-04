import { SpotifyPlaylist, SpotifyTrack, ConversionResult, ConversionProgress } from '../types';
import { spotifyApi } from './spotifyApi';
import { appleMusicApi } from './appleMusicApi';
import { trackMatcher } from './trackMatcher';

export interface PlaylistConversionResult {
  playlist: SpotifyPlaylist;
  totalTracks: number;
  successfulTracks: number;
  failedTracks: number;
  results: ConversionResult[];
  applePlaylistId?: string;
  error?: string;
}

export async function convertPlaylist(
  playlist: SpotifyPlaylist,
  onProgress?: (progress: ConversionProgress) => void
): Promise<PlaylistConversionResult> {
  const results: ConversionResult[] = [];
  
  try {
    // Get all tracks from the Spotify playlist
    const tracks = await spotifyApi.getAllPlaylistTracks(playlist.id);
    const totalTracks = tracks.length;
    
    if (totalTracks === 0) {
      return {
        playlist,
        totalTracks: 0,
        successfulTracks: 0,
        failedTracks: 0,
        results: [],
        error: 'Playlist is empty',
      };
    }

    // Update initial progress
    onProgress?.({
      total: totalTracks,
      completed: 0,
      successful: 0,
      failed: 0,
      status: 'converting',
      currentTrack: tracks[0]?.name,
    });

    // Create Apple Music playlist
    let applePlaylistId: string | undefined;
    try {
      const applePlaylist = await appleMusicApi.createPlaylist(
        playlist.name,
        playlist.description || `Converted from Spotify on ${new Date().toLocaleDateString()}`
      );
      applePlaylistId = applePlaylist.id;
    } catch (error) {
      console.error('Failed to create Apple Music playlist:', error);
      return {
        playlist,
        totalTracks,
        successfulTracks: 0,
        failedTracks: totalTracks,
        results: [],
        error: 'Failed to create Apple Music playlist',
      };
    }

    // Convert tracks
    const successfulTrackIds: string[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      
      try {
        // Find matching Apple Music track
        const matchResult = await trackMatcher.findMatch(track);
        
        if (matchResult.appleTrack) {
          results.push({
            spotifyTrack: track,
            appleTrack: matchResult.appleTrack,
            status: 'success',
            confidence: matchResult.confidence,
          });
          
          successfulTrackIds.push(matchResult.appleTrack.id);
          successCount++;
        } else {
          results.push({
            spotifyTrack: track,
            status: 'failed',
            error: 'No matching track found',
          });
          failCount++;
        }
      } catch (error) {
        results.push({
          spotifyTrack: track,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failCount++;
      }

      // Update progress
      onProgress?.({
        total: totalTracks,
        completed: i + 1,
        successful: successCount,
        failed: failCount,
        status: 'converting',
        currentTrack: tracks[Math.min(i + 1, tracks.length - 1)]?.name,
      });

      // Add a small delay to avoid rate limiting
      if (i < tracks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Add successful tracks to the Apple Music playlist
    if (successfulTrackIds.length > 0 && applePlaylistId) {
      try {
        await appleMusicApi.addTracksToPlaylist(applePlaylistId, successfulTrackIds);
      } catch (error) {
        console.error('Failed to add tracks to playlist:', error);
        // Don't fail the entire conversion if we can't add tracks
      }
    }

    return {
      playlist,
      totalTracks,
      successfulTracks: successCount,
      failedTracks: failCount,
      results,
      applePlaylistId,
    };
  } catch (error) {
    console.error('Playlist conversion error:', error);
    return {
      playlist,
      totalTracks: 0,
      successfulTracks: 0,
      failedTracks: 0,
      results,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Convert multiple playlists
export async function convertPlaylists(
  playlists: SpotifyPlaylist[],
  onProgress?: (playlistIndex: number, progress: ConversionProgress) => void
): Promise<PlaylistConversionResult[]> {
  const results: PlaylistConversionResult[] = [];
  
  for (let i = 0; i < playlists.length; i++) {
    const result = await convertPlaylist(
      playlists[i],
      (progress) => onProgress?.(i, progress)
    );
    results.push(result);
  }
  
  return results;
}