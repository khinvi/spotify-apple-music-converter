import React from 'react';
import { AuthState } from '../types';
import './AuthSection.css';

interface AuthSectionProps {
  authState: AuthState;
  onSpotifyLogin: () => void;
  onSpotifyLogout: () => void;
  onAppleLogin: () => void;
  onAppleLogout: () => void;
}

const AuthSection: React.FC<AuthSectionProps> = ({
  authState,
  onSpotifyLogin,
  onSpotifyLogout,
  onAppleLogin,
  onAppleLogout,
}) => {
  return (
    <div className="auth-section">
      <div className="auth-service">
        <div className="service-header">
          <img src="/spotify-icon.svg" alt="Spotify" className="service-icon" />
          <h3>Spotify</h3>
        </div>
        
        {authState.spotify.isAuthenticated ? (
          <div className="auth-status authenticated">
            <div className="user-info">
              {authState.spotify.user?.images?.[0]?.url && (
                <img 
                  src={authState.spotify.user.images[0].url} 
                  alt="Profile" 
                  className="user-avatar"
                />
              )}
              <div>
                <p className="user-name">{authState.spotify.user?.display_name}</p>
                <p className="user-email">{authState.spotify.user?.email}</p>
              </div>
            </div>
            <button onClick={onSpotifyLogout} className="auth-button logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-status">
            <p>Connect your Spotify account to get started</p>
            <button onClick={onSpotifyLogin} className="auth-button spotify">
              Connect Spotify
            </button>
          </div>
        )}
      </div>

      <div className="auth-arrow">→</div>

      <div className="auth-service">
        <div className="service-header">
          <img src="/apple-music-icon.svg" alt="Apple Music" className="service-icon" />
          <h3>Apple Music</h3>
        </div>
        
        {authState.apple.isAuthenticated ? (
          <div className="auth-status authenticated">
            <div className="user-info">
              <div className="user-avatar apple">🎵</div>
              <div>
                <p className="user-name">Connected</p>
                <p className="user-email">Apple Music Account</p>
              </div>
            </div>
            <button onClick={onAppleLogout} className="auth-button logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-status">
            <p>Connect your Apple Music account</p>
            <button 
              onClick={onAppleLogin} 
              className="auth-button apple"
              disabled={!authState.spotify.isAuthenticated}
            >
              Connect Apple Music
            </button>
            {!authState.spotify.isAuthenticated && (
              <p className="auth-hint">Connect Spotify first</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSection;