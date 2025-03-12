'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/PlayerStats.module.css';
import StatsTable from './StatsTable';
import { apiUrl, checkLocalBackendStatus } from '../lib/apiConfig';

const PlayerStats = () => {
  const [playerInput, setPlayerInput] = useState('');
  const [season, setSeason] = useState('2024-25');
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'running', 'not-running'

  useEffect(() => {
    // Check if local backend is running when component mounts
    checkBackendStatus();
    
    // Start polling for backend status every 10 seconds
    const intervalId = setInterval(checkBackendStatus, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    const isRunning = await checkLocalBackendStatus();
    console.log('Backend status check result (PlayerStats):', isRunning);
    setBackendStatus(isRunning ? 'running' : 'not-running');
  };

  const fetchPlayerStats = async () => {
    if (!playerInput.trim()) {
      setError('Please enter a player name');
      return;
    }

    if (backendStatus !== 'running') {
      setError('Local backend server is not running. Please start the server and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = `/api/player-stats?player=${encodeURIComponent(playerInput)}&season=${season}`;
      const url = apiUrl(endpoint);
      console.log(`Fetching player data from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Failed to fetch player stats: ${response.status}`);
      }
      
    
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Response is not JSON, content type:', contentType);
      }
      
    
      const data = await response.json();
      
      setPlayerStats(data);
    } catch (err) {
      console.error('Error fetching player stats:', err);
      setError(err.message);
      setPlayerStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerColumns = () => {
    return [
      { key: 'PLAYER_NAME', label: 'Player' },
      { key: 'TEAM_ABBREVIATION', label: 'Team' },
      { key: 'GP', label: 'Games' },
      { key: 'MIN', label: 'Minutes' },
      { key: 'PTS', label: 'Points' },
      { key: 'FG_PCT', label: 'FG%' },
      { key: 'FG3_PCT', label: '3P%' },
      { key: 'FT_PCT', label: 'FT%' },
      { key: 'REB', label: 'Rebounds' },
      { key: 'AST', label: 'Assists' },
      { key: 'STL', label: 'Steals' },
      { key: 'BLK', label: 'Blocks' },
      { key: 'TOV', label: 'Turnovers' },
      { key: 'PLUS_MINUS', label: '+/-' },
    ];
  };

  const renderBackendStatus = () => {
    switch (backendStatus) {
      case 'running':
        return (
          <div className={`${styles['status-indicator']} ${styles['status-running']}`}>
            <span className={`${styles['status-dot']} ${styles['status-dot-running']}`}></span>
            Local server running
          </div>
        );
      case 'not-running':
        return (
          <div className={`${styles['status-indicator']} ${styles['status-not-running']}`}>
            <span className={`${styles['status-dot']} ${styles['status-dot-not-running']}`}></span>
            Local server not running
            <button 
              onClick={checkBackendStatus}
              className={styles['check-again-button']}
            >
              Check Again
            </button>
          </div>
        );
      default:
        return (
          <div className={`${styles['status-indicator']} ${styles['status-checking']}`}>
            <span className={`${styles['status-dot']} ${styles['status-dot-checking']}`}></span>
            Checking server status...
          </div>
        );
    }
  };

  return (
    <div className={`player-stats-container ${styles['player-stats-container']}`}>
      <h2>Player Statistics</h2>
      
      <div className={styles['center-container']}>
        {renderBackendStatus()}
      </div>
    
      <div className={styles['center-container']}>
        <div className={styles['controls-container']}>
          <div className={styles['input-group']}>
            <label htmlFor="player-input">Player Name:</label>
            <input
              id="player-input"
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="e.g. LeBron James"
              className={styles['player-input']}
              disabled={backendStatus !== 'running'}
            />
          </div>
          
          <div className={styles['input-group']}>
            <label htmlFor="season-input">Season:</label>
            <select
              id="season-input"
              className={styles['season-select']}
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              disabled={backendStatus !== 'running'}
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
              <option value="2021-22">2021-22</option>
              <option value="2020-21">2020-21</option>
            </select>
          </div>
          
          <button 
            className={styles['search-button']}
            onClick={fetchPlayerStats}
            disabled={loading || backendStatus !== 'running'}
          >
            {loading ? 'Loading...' : 'Get Stats'}
          </button>
        </div>
      </div>

      {error && <div className={`error-message ${styles['error-message']}`}>{error}</div>}

      {playerStats && (
        <div className={`stats-results ${styles['stats-results']}`}>
          <h3>{playerStats.PLAYER_NAME} ({season})</h3>
          <div className={`player-summary ${styles['player-summary']}`}>
            <div className={`summary-item ${styles['summary-item']}`}>
              <span className={`label ${styles.label}`}>Team:</span>
              <span className={`value ${styles.value}`}>{playerStats.TEAM_ABBREVIATION}</span>
            </div>
            <div className={`summary-item ${styles['summary-item']}`}>
              <span className={`label ${styles.label}`}>PPG:</span>
              <span className={`value ${styles.value}`}>{playerStats.PTS.toFixed(1)}</span>
            </div>
            <div className={`summary-item ${styles['summary-item']}`}>
              <span className={`label ${styles.label}`}>RPG:</span>
              <span className={`value ${styles.value}`}>{playerStats.REB.toFixed(1)}</span>
            </div>
            <div className={`summary-item ${styles['summary-item']}`}>
              <span className={`label ${styles.label}`}>APG:</span>
              <span className={`value ${styles.value}`}>{playerStats.AST.toFixed(1)}</span>
            </div>
          </div>
          
          <StatsTable data={[playerStats]} columns={getPlayerColumns()} />
        </div>
      )}
    </div>
  );
};

export default PlayerStats;
