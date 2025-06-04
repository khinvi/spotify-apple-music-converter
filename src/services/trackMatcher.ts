import { SpotifyTrack, AppleTrack, MatchStrategy } from '../types';
import { appleMusicApi } from './appleMusicApi';

class TrackMatcher {
  // Calculate string similarity (Levenshtein distance based)
  private stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    
    const editDistance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return maxLength === 0 ? 1 : 1 - (editDistance / maxLength);
  }

  // Levenshtein distance calculation
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Preprocess track name for better matching
  private preprocessTrackName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s*\(feat\..*?\)\s*/gi, '') // Remove featuring
      .replace(/\s*\(ft\..*?\)\s*/gi, '')
      .replace(/\s*\(with.*?\)\s*/gi, '') // Remove with
      .replace(/\s*-\s*(remaster|remastered|remix|edit|version|deluxe|explicit|clean).*$/gi, '') // Remove versions
      .replace(/\s*\[.*?\]\s*/g, '') // Remove content in brackets
      .replace(/[^\w\s]/g, ' ') // Replace special chars with space
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  // Preprocess artist name
  private preprocessArtistName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s*,\s*/g, ' ') // Replace commas with spaces
      .replace(/\s*&\s*/g, ' and ') // Replace & with and
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Calculate duration similarity (within 2 seconds)
  private durationSimilarity(duration1: number, duration2: number): number {
    const diff = Math.abs(duration1 - duration2);
    if (diff <= 2000) return 1; // Within 2 seconds
    if (diff <= 5000) return 0.8; // Within 5 seconds
    if (diff <= 10000) return 0.5; // Within 10 seconds
    return Math.max(0, 1 - (diff / 60000)); // Gradual decrease
  }

  // Calculate artist similarity
  private artistSimilarity(spotifyArtists: string[], appleArtist: string): number {
    const appleArtistProcessed = this.preprocessArtistName(appleArtist);
    
    // Check each Spotify artist
    const similarities = spotifyArtists.map(artist => {
      const spotifyArtistProcessed = this.preprocessArtistName(artist);
      
      // Check if one contains the other
      if (appleArtistProcessed.includes(spotifyArtistProcessed) || 
          spotifyArtistProcessed.includes(appleArtistProcessed)) {
        return 1;
      }
      
      return this.stringSimilarity(spotifyArtistProcessed, appleArtistProcessed);
    });
    
    return Math.max(...similarities);
  }

  // Calculate overall match score
  private calculateMatchScore(spotifyTrack: SpotifyTrack, appleTrack: AppleTrack): number {
    let score = 0;
    
    // Title similarity (40% weight)
    const titleSim = this.stringSimilarity(
      this.preprocessTrackName(spotifyTrack.name),
      this.preprocessTrackName(appleTrack.attributes.name)
    );
    score += titleSim * 0.4;
    
    // Artist similarity (35% weight)
    const artistNames = spotifyTrack.artists.map(a => a.name);
    const artistSim = this.artistSimilarity(artistNames, appleTrack.attributes.artistName);
    score += artistSim * 0.35;
    
    // Duration similarity (15% weight)
    const durationSim = this.durationSimilarity(
      spotifyTrack.duration_ms,
      appleTrack.attributes.durationInMillis
    );
    score += durationSim * 0.15;
    
    // Album similarity (10% weight)
    const albumSim = this.stringSimilarity(
      this.preprocessTrackName(spotifyTrack.album.name),
      this.preprocessTrackName(appleTrack.attributes.albumName)
    );
    score += albumSim * 0.1;
    
    return score;
  }

  // Find best match from search results
  private findBestMatch(spotifyTrack: SpotifyTrack, candidates: AppleTrack[]): {
    track: AppleTrack | null;
    confidence: number;
  } {
    if (candidates.length === 0) {
      return { track: null, confidence: 0 };
    }
    
    const scored = candidates.map(candidate => ({
      track: candidate,
      score: this.calculateMatchScore(spotifyTrack, candidate),
    }));
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    const best = scored[0];
    
    // Only return matches with reasonable confidence
    if (best.score >= 0.6) {
      return { track: best.track, confidence: best.score };
    }
    
    return { track: null, confidence: 0 };
  }

  // Match strategies
  private createStrategies(): MatchStrategy[] {
    return [
      // 1. ISRC matching (highest confidence)
      {
        name: 'ISRC',
        confidence: 0.99,
        execute: async (track: SpotifyTrack) => {
          if (!track.external_ids?.isrc) return null;
          return await appleMusicApi.searchByISRC(track.external_ids.isrc);
        },
      },
      
      // 2. Exact title + first artist
      {
        name: 'Exact Title + Artist',
        confidence: 0.9,
        execute: async (track: SpotifyTrack) => {
          const query = `${track.name} ${track.artists[0].name}`;
          const results = await appleMusicApi.searchTracks(query, 10);
          const match = this.findBestMatch(track, results);
          return match.confidence >= 0.85 ? match.track : null;
        },
      },
      
      // 3. Preprocessed title + artist
      {
        name: 'Fuzzy Title + Artist',
        confidence: 0.8,
        execute: async (track: SpotifyTrack) => {
          const processedTitle = this.preprocessTrackName(track.name);
          const processedArtist = this.preprocessArtistName(track.artists[0].name);
          const query = `${processedTitle} ${processedArtist}`;
          const results = await appleMusicApi.searchTracks(query, 15);
          const match = this.findBestMatch(track, results);
          return match.confidence >= 0.75 ? match.track : null;
        },
      },
      
      // 4. Title only (last resort)
      {
        name: 'Title Only',
        confidence: 0.6,
        execute: async (track: SpotifyTrack) => {
          const results = await appleMusicApi.searchTracks(track.name, 20);
          const match = this.findBestMatch(track, results);
          return match.confidence >= 0.7 ? match.track : null;
        },
      },
    ];
  }

  // Main matching method
  async findMatch(spotifyTrack: SpotifyTrack): Promise<{
    appleTrack: AppleTrack | null;
    confidence: number;
    strategy: string;
  }> {
    const strategies = this.createStrategies();
    
    for (const strategy of strategies) {
      try {
        const match = await strategy.execute(spotifyTrack);
        if (match) {
          return {
            appleTrack: match,
            confidence: strategy.confidence,
            strategy: strategy.name,
          };
        }
      } catch (error) {
        console.error(`Strategy ${strategy.name} failed:`, error);
      }
    }
    
    return {
      appleTrack: null,
      confidence: 0,
      strategy: 'None',
    };
  }
}

export const trackMatcher = new TrackMatcher();