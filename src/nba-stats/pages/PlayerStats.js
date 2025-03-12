'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/TeamStats.module.css';
import StatsTable from './StatsTable';
import { apiUrl, checkLocalBackendStatus } from '../lib/apiConfig';

const TeamStats = () => {
  const [teamInput, setTeamInput] = useState('');
  const [season, setSeason] = useState('2024-25');
  const [teamStats, setTeamStats] = useState(null);
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
    console.log('Backend status check result (TeamStats):', isRunning);
    setBackendStatus(isRunning ? 'running' : 'not-running');
  };

  const fetchTeamStats = async () => {
    if (!teamInput.trim()) {
      setError('Please enter a team name or abbreviation');
      return;
    }

    if (backendStatus !== 'running') {
      setError('Local backend server is not running. Please start the server and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = `/api/team-stats?team=${encodeURIComponent(teamInput)}&season=${season}`;
      const url = apiUrl(endpoint);
      console.log(`Fetching team data from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Failed to fetch team stats: ${response.status}`);
      }
      
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Response is not JSON, content type:', contentType);
      }
      
      
      const data = await response.json();
      
      setTeamStats(data);
    } catch (err) {
      console.error('Error fetching team stats:', err);
      setError(err.message);
      setTeamStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getTeamColumns = () => {
    return [
      { key: 'TEAM_NAME', label: 'Team' },
      { key: 'GP', label: 'Games' },
      { key: 'W', label: 'Wins' },
      { key: 'L', label: 'Losses' },
      { key: 'W_PCT', label: 'Win %' },
      { key: 'PTS', label: 'PPG' },
      { key: 'FG_PCT', label: 'FG%' },
      { key: 'FG3_PCT', label: '3P%' },
      { key: 'FT_PCT', label: 'FT%' },
      { key: 'REB', label: 'Rebounds' },
      { key: 'AST', label: 'Assists' },
      { key: 'STL', label: 'Steals' },
      { key: 'BLK', label: 'Blocks' },
      { key: 'TOV', label: 'Turnovers' },
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
    <div className={`team-stats-container ${styles['team-stats-container']}`}>
      <h2>Team Statistics</h2>
      
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
            <label htmlFor="team-input">Team Name:</label>
            <input
              id="team-input"
              type="text"
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              placeholder="e.g. Lakers or LAL"
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
            onClick={fetchTeamStats}
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

      {teamStats && (
        <div className={`stats-results ${styles['stats-results']}`}>
          <h3>{teamStats.TEAM_NAME} ({season})</h3>
          <div className={`team-summary ${styles['team-summary']}`}>
            <div className={`summary-item ${styles['summary-item']}`}>
              <span className={`label ${styles.label}`}>Record:</span>
              <span className={`value ${styles.value}`}>{teamStats.W}-{teamStats.L}</span>
            </div>
            <div className={`summary-item ${styles['summary-item']}`}>
              <span className={`label ${styles.label}`}>Win %:</span>
              <span className={`value ${styles.value}`}>{(teamStats.W_PCT * 100).toFixed(1)}%</span>
            </div>
            <div className={`summary-item ${styles['summary-item']}`}>
              <span className={`label ${styles.label}`}>PPG:</span>
              <span className={`value ${styles.value}`}>{teamStats.PTS.toFixed(1)}</span>
            </div>
          </div>
          
          <StatsTable data={[teamStats]} columns={getTeamColumns()} />
        </div>
      )}
    </div>
  );
};

export default TeamStats;
