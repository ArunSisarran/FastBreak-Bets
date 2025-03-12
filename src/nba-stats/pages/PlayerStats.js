'use client';

import React, { useState } from 'react';
import styles from '../styles/PlayerStats.module.css';
import StatsTable from './StatsTable';

const PlayerStats = () => {
  const [playerInput, setPlayerInput] = useState('');
  const [season, setSeason] = useState('2024-25');
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayerStats = async () => {
    if (!playerInput.trim()) {
      setError('Please enter a player name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/player-stats?player=${encodeURIComponent(playerInput)}&season=${season}`, {
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

  return (
    <div className={`player-stats-container ${styles['player-stats-container']}`}>
      <h2>Player Statistics</h2>
      
    
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
            disabled={loading}
            style={{
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
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
