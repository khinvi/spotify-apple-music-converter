import React, { useState } from 'react';
import { PlaylistConversionResult } from '../services/playlistConverter';
import { ConversionResult } from '../types';
import './ConversionResults.css';

interface ConversionResultsProps {
  results: PlaylistConversionResult[];
}

const ConversionResults: React.FC<ConversionResultsProps> = ({ results }) => {
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
  const [filterFailed, setFilterFailed] = useState(false);

  const totalTracks = results.reduce((sum, r) => sum + r.totalTracks, 0);
  const totalSuccess = results.reduce((sum, r) => sum + r.successfulTracks, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failedTracks, 0);

  const exportFailedTracks = () => {
    const failedTracks: string[] = [];
    
    results.forEach(result => {
      result.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          failedTracks.push(
            `${r.spotifyTrack.name} - ${r.spotifyTrack.artists.map(a => a.name).join(', ')}`
          );
        });
    });

    const blob = new Blob([failedTracks.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed-tracks.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="conversion-results">
      <div className="results-header">
        <h2>Conversion Results</h2>
        <div className="results-summary">
          <span className="summary-stat">
            <strong>{results.length}</strong> playlist{results.length > 1 ? 's' : ''} converted
          </span>
          <span className="summary-stat success">
            <strong>{totalSuccess}</strong> tracks matched
          </span>
          <span className="summary-stat failed">
            <strong>{totalFailed}</strong> tracks failed
          </span>
          <span className="summary-stat">
            <strong>{Math.round((totalSuccess / totalTracks) * 100)}%</strong> success rate
          </span>
        </div>
      </div>

      <div className="results-controls">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filterFailed}
            onChange={(e) => setFilterFailed(e.target.checked)}
          />
          Show only failed tracks
        </label>
        
        {totalFailed > 0 && (
          <button onClick={exportFailedTracks} className="export-button">
            Export Failed Tracks
          </button>
        )}
      </div>

      <div className="playlist-results">
        {results.map((result) => (
          <div key={result.playlist.id} className="playlist-result">
            <div 
              className="playlist-result-header"
              onClick={() => setExpandedPlaylist(
                expandedPlaylist === result.playlist.id ? null : result.playlist.id
              )}
            >
              <div className="playlist-info">
                <h3>{result.playlist.name}</h3>
                <p>
                  {result.successfulTracks} of {result.totalTracks} tracks converted
                  {result.error && <span className="error"> • Error: {result.error}</span>}
                </p>
              </div>
              <div className="expand-icon">
                {expandedPlaylist === result.playlist.id ? '▼' : '▶'}
              </div>
            </div>

            {expandedPlaylist === result.playlist.id && (
              <div className="track-results">
                {result.results
                  .filter(r => !filterFailed || r.status === 'failed')
                  .map((trackResult, index) => (
                    <TrackResult key={index} result={trackResult} />
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TrackResult: React.FC<{ result: ConversionResult }> = ({ result }) => {
  const { spotifyTrack, appleTrack, status, confidence, error } = result;

  return (
    <div className={`track-result ${status}`}>
      <div className="track-info">
        <div className="track-details">
          <strong>{spotifyTrack.name}</strong>
          <span className="artists">
            {spotifyTrack.artists.map(a => a.name).join(', ')}
          </span>
          <span className="album">{spotifyTrack.album.name}</span>
        </div>
        
        {status === 'success' && appleTrack && (
          <div className="match-info">
            <span className="match-indicator">✓ Matched</span>
            {confidence && (
              <span className="confidence">
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
          </div>
        )}
        
        {status === 'failed' && (
          <div className="error-info">
            <span className="error-indicator">✗ Failed</span>
            <span className="error-message">{error || 'No match found'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionResults;