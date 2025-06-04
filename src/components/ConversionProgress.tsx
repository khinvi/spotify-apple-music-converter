import React from 'react';
import { ConversionProgress } from '../types';
import './ConversionProgress.css';

interface ConversionProgressBarProps {
  progress: ConversionProgress;
}

const ConversionProgressBar: React.FC<ConversionProgressBarProps> = ({ progress }) => {
  const percentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  const successRate = progress.completed > 0
    ? Math.round((progress.successful / progress.completed) * 100)
    : 0;

  return (
    <div className="conversion-progress">
      <div className="progress-header">
        <h3>
          {progress.status === 'converting' ? 'Converting...' : 'Conversion Complete'}
        </h3>
        {progress.currentTrack && progress.status === 'converting' && (
          <p className="current-track">Currently matching: {progress.currentTrack}</p>
        )}
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="progress-percentage">{percentage}%</span>
      </div>

      <div className="progress-stats">
        <div className="stat">
          <span className="stat-label">Total Tracks:</span>
          <span className="stat-value">{progress.total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{progress.completed}</span>
        </div>
        <div className="stat success">
          <span className="stat-label">Successful:</span>
          <span className="stat-value">{progress.successful}</span>
        </div>
        <div className="stat failed">
          <span className="stat-label">Failed:</span>
          <span className="stat-value">{progress.failed}</span>
        </div>
      </div>

      {progress.status === 'completed' && (
        <div className="completion-summary">
          <p className="success-rate">
            Success Rate: <strong>{successRate}%</strong>
          </p>
          {progress.failed > 0 && (
            <p className="failed-message">
              {progress.failed} track{progress.failed > 1 ? 's' : ''} could not be matched.
              Check the results below for details.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversionProgressBar;