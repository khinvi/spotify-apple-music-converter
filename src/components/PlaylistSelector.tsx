import React, { useState } from 'react';
import { SpotifyPlaylist } from '../types';
import './PlaylistSelector.css';

interface PlaylistSelectorProps {
  playlists: SpotifyPlaylist[];
  selectedPlaylists: string[];
  onToggle: (playlistId: string) => void;
  isLoading: boolean;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  playlists,
  selectedPlaylists,
  onToggle,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'tracks'>('name');

  const filteredPlaylists = playlists
    .filter(playlist => 
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.owner.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.tracks.total - a.tracks.total;
    });

  const handleSelectAll = () => {
    const allFiltered = filteredPlaylists.map(p => p.id);
    allFiltered.forEach(id => {
      if (!selectedPlaylists.includes(id)) {
        onToggle(id);
      }
    });
  };

  const handleDeselectAll = () => {
    selectedPlaylists.forEach(id => onToggle(id));
  };

  if (isLoading) {
    return (
      <div className="playlist-selector loading">
        <div className="loading-spinner"></div>
        <p>Loading your playlists...</p>
      </div>
    );
  }

  return (
    <div className="playlist-selector">
      <div className="selector-header">
        <h2>Select Playlists to Convert</h2>
        <p className="playlist-count">
          {selectedPlaylists.length} of {playlists.length} selected
        </p>
      </div>

      <div className="selector-controls">
        <input
          type="text"
          placeholder="Search playlists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="control-buttons">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'tracks')}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="tracks">Sort by Track Count</option>
          </select>
          
          <button onClick={handleSelectAll} className="select-button">
            Select All
          </button>
          <button onClick={handleDeselectAll} className="select-button">
            Deselect All
          </button>
        </div>
      </div>

      <div className="playlist-grid">
        {filteredPlaylists.map(playlist => (
          <div
            key={playlist.id}
            className={`playlist-card ${selectedPlaylists.includes(playlist.id) ? 'selected' : ''}`}
            onClick={() => onToggle(playlist.id)}
          >
            <div className="playlist-image">
              {playlist.images?.[0]?.url ? (
                <img src={playlist.images[0].url} alt={playlist.name} />
              ) : (
                <div className="playlist-placeholder">🎵</div>
              )}
              {selectedPlaylists.includes(playlist.id) && (
                <div className="selected-overlay">
                  <span className="checkmark">✓</span>
                </div>
              )}
            </div>
            
            <div className="playlist-info">
              <h3 className="playlist-name">{playlist.name}</h3>
              <p className="playlist-details">
                {playlist.tracks.total} tracks • by {playlist.owner.display_name}
              </p>
              {playlist.description && (
                <p className="playlist-description">{playlist.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlaylists.length === 0 && (
        <div className="no-results">
          <p>No playlists found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default PlaylistSelector;