import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthState, SpotifyPlaylist, ConversionProgress } from './types';
import { spotifyAuth } from './services/spotifyAuth';
import { appleMusicAuth, AppleMusicAuth } from './services/appleMusicAuth';
import { spotifyApi } from './services/spotifyApi';
import AuthSection from './components/AuthSection';
import PlaylistSelector from './components/PlaylistSelector';
import ConversionProgressBar from './components/ConversionProgress';
import ConversionResults from './components/ConversionResults';
import { convertPlaylist } from './services/playlistConverter';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    spotify: { isAuthenticated: false },
    apple: { isAuthenticated: false },
  });
  
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    status: 'idle',
  });
  const [conversionResults, setConversionResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Load Apple Music script
    AppleMusicAuth.loadMusicKitScript().catch(console.error);
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleSpotifyCallback(code);
    }
  }, []);

  const checkAuthStatus = async () => {
    // Check Spotify
    const spotifyAuthenticated = spotifyAuth.isAuthenticated();
    if (spotifyAuthenticated) {
      try {
        const user = await spotifyAuth.getCurrentUser();
        setAuthState(prev => ({
          ...prev,
          spotify: {
            isAuthenticated: true,
            user,
          },
        }));
        loadPlaylists();
      } catch (error) {
        console.error('Failed to get Spotify user:', error);
      }
    }

    // Check Apple Music
    try {
      await appleMusicAuth.configure();
      const appleAuthenticated = appleMusicAuth.isAuthorized();
      setAuthState(prev => ({
        ...prev,
        apple: { isAuthenticated: appleAuthenticated },
      }));
    } catch (error) {
      console.error('Failed to check Apple Music auth:', error);
    }
  };

  const handleSpotifyCallback = async (code: string) => {
    try {
      const success = await spotifyAuth.handleCallback(code);
      if (success) {
        window.history.replaceState({}, document.title, window.location.pathname);
        checkAuthStatus();
      }
    } catch (error) {
      console.error('Spotify callback error:', error);
    }
  };

  const handleSpotifyLogin = () => {
    spotifyAuth.authorize();
  };

  const handleSpotifyLogout = () => {
    spotifyAuth.logout();
    setAuthState(prev => ({
      ...prev,
      spotify: { isAuthenticated: false },
    }));
    setPlaylists([]);
    setSelectedPlaylists([]);
  };

  const handleAppleLogin = async () => {
    try {
      await appleMusicAuth.authorize();
      setAuthState(prev => ({
        ...prev,
        apple: { isAuthenticated: true },
      }));
    } catch (error) {
      console.error('Apple Music login error:', error);
    }
  };

  const handleAppleLogout = () => {
    appleMusicAuth.unauthorize();
    setAuthState(prev => ({
      ...prev,
      apple: { isAuthenticated: false },
    }));
  };

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const userPlaylists = await spotifyApi.getAllUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaylistToggle = (playlistId: string) => {
    setSelectedPlaylists(prev => {
      if (prev.includes(playlistId)) {
        return prev.filter(id => id !== playlistId);
      }
      return [...prev, playlistId];
    });
  };

  const handleConvert = async () => {
    if (selectedPlaylists.length === 0) return;

    setConversionProgress({
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      status: 'converting',
    });
    setConversionResults([]);

    const results = [];

    for (const playlistId of selectedPlaylists) {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) continue;

      const result = await convertPlaylist(
        playlist,
        (progress) => setConversionProgress(progress)
      );
      
      results.push(result);
    }

    setConversionResults(results);
    setConversionProgress(prev => ({ ...prev, status: 'completed' }));
  };

  const canConvert = authState.spotify.isAuthenticated && 
                     authState.apple.isAuthenticated && 
                     selectedPlaylists.length > 0;

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 Spotify to Apple Music Converter</h1>
        <p>Transfer your playlists between music services with ease</p>
      </header>

      <main className="App-main">
        <AuthSection
          authState={authState}
          onSpotifyLogin={handleSpotifyLogin}
          onSpotifyLogout={handleSpotifyLogout}
          onAppleLogin={handleAppleLogin}
          onAppleLogout={handleAppleLogout}
        />

        {authState.spotify.isAuthenticated && (
          <PlaylistSelector
            playlists={playlists}
            selectedPlaylists={selectedPlaylists}
            onToggle={handlePlaylistToggle}
            isLoading={isLoading}
          />
        )}

        {canConvert && (
          <div className="convert-section">
            <button
              className="convert-button"
              onClick={handleConvert}
              disabled={conversionProgress.status === 'converting'}
            >
              {conversionProgress.status === 'converting' 
                ? 'Converting...' 
                : `Convert ${selectedPlaylists.length} Playlist${selectedPlaylists.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {conversionProgress.status !== 'idle' && (
          <ConversionProgressBar progress={conversionProgress} />
        )}

        {conversionResults.length > 0 && (
          <ConversionResults results={conversionResults} />
        )}
      </main>

      <footer className="App-footer">
        <p>
          Made with ❤️ by the open source community | 
          <a href="https://github.com/YOUR_USERNAME/spotify-apple-music-converter" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;