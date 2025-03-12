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
    
    // Clean up interval on unmount
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
          <div className={styles['status-indicator']} style={{
            backgroundColor: '#e6f4ea',
            color: '#137333',
            padding: '8px 16px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#137333'
            }}></span>
            Local server running
          </div>
        );
      case 'not-running':
        return (
          <div className={styles['status-indicator']} style={{
            backgroundColor: '#fce8e6',
            color: '#c5221f',
            padding: '8px 16px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#c5221f'
            }}></span>
            Local server not running
            <button 
              onClick={checkBackendStatus}
              style={{
                marginLeft: '10px',
                backgroundColor: 'white',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Check Again
            </button>
          </div>
        );
      default:
        return (
          <div className={styles['status-indicator']} style={{
            backgroundColor: '#f8f9fa',
            color: '#5f6368',
            padding: '8px 16px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#5f6368',
              animation: 'pulse 1.5s infinite'
            }}></span>
            Checking server status...
          </div>
        );
    }
  };

  return (
    <div className={`player-stats-container ${styles['player-stats-container']}`}>
      <h2>Player Statistics</h2>
      
      {/* Backend Status Indicator */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {renderBackendStatus()}
      </div>
    
      <div style={{ textAlign: 'center' }}>
      
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: '#f8f9fa',
            padding: '16px 24px',
            borderRadius: '8px',
            gap: '24px'
          }}
        >
          <div className={styles['input-group']} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="player-input">Player Name:</label>
            <input
              id="player-input"
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="e.g. LeBron James"
              style={{
                padding: '10px 16px',
                border: '2px solid #dadce0',
                borderRadius: '8px',
                fontSize: '15px',
                backgroundColor: 'white',
                minWidth: '200px'
              }}
              disabled={backendStatus !== 'running'}
            />
          </div>
          
          <div className={styles['input-group']} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="season-input">Season:</label>
            <select
              id="season-input"
              style={{
                padding: '10px 36px 10px 16px', 
                border: '2px solid #dadce0',
                borderRadius: '8px',
                fontSize: '15px',
                backgroundColor: 'white',
                minWidth: '120px'  
              }}
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
            style={{
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: (loading || backendStatus !== 'running') ? 'not-allowed' : 'pointer',
              opacity: (backendStatus !== 'running') ? 0.6 : 1
            }}
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
