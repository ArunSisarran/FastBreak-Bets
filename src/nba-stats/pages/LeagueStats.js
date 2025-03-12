'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/LeagueStats.module.css';
import StatsTable from './StatsTable';

const LeagueStats = () => {
  const [season, setSeason] = useState('2024-25');
  const [leagueStats, setLeagueStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'W_PCT', direction: 'desc' });
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'running', 'not-running'

  useEffect(() => {
    // Check if local backend is running when component mounts
    checkBackendStatus();
    
    // Start polling for backend status every 10 seconds
    const intervalId = setInterval(checkBackendStatus, 10000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Fetch league stats when season changes or when backend comes online
    if (backendStatus === 'running') {
      fetchLeagueStats();
    }
  }, [season, backendStatus]);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    const isRunning = await checkLocalBackendStatus();
    setBackendStatus(isRunning ? 'running' : 'not-running');
  };

  const fetchLeagueStats = async () => {
    if (backendStatus !== 'running') {
      setError('Local backend server is not running. Please start the server and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiUrl = `/api/team-stats/league?season=${season}`;
      console.log(`Fetching data from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Failed to fetch league stats: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const sortedData = [...data].sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });

        setLeagueStats(sortedData);
      } else {
        throw new Error('Unexpected data format received from server');
      }
    } catch (err) {
      console.error('Error fetching league stats:', err);
      setError(err.message);
      setLeagueStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    if (leagueStats) {
      const sortedData = [...leagueStats].sort((a, b) => {
        if (a[key] < b[key]) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setLeagueStats(sortedData);
    }
  };

  const getLeagueColumns = () => {
    return [
      { key: 'TEAM_NAME', label: 'Team', sortable: true },
      { key: 'GP', label: 'Games', sortable: true },
      { key: 'W', label: 'Wins', sortable: true },
      { key: 'L', label: 'Losses', sortable: true },
      { key: 'W_PCT', label: 'Win %', sortable: true },
      { key: 'PTS', label: 'PPG', sortable: true },
      { key: 'FG_PCT', label: 'FG%', sortable: true },
      { key: 'FG3_PCT', label: '3P%', sortable: true },
      { key: 'FT_PCT', label: 'FT%', sortable: true },
      { key: 'REB', label: 'RPG', sortable: true },
      { key: 'AST', label: 'APG', sortable: true },
      { key: 'STL', label: 'SPG', sortable: true },
      { key: 'BLK', label: 'BPG', sortable: true },
      { key: 'TOV', label: 'TOPG', sortable: true },
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
    <div className={`league-stats-container ${styles['league-stats-container']}`}>
      <h2>League Overview</h2>
      
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
            className={styles['refresh-button']}
            onClick={fetchLeagueStats}
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
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className={`error-message ${styles['error-message']}`}>{error}</div>}
      {loading && <div className={`loading ${styles.loading}`}>Loading league data...</div>}

      {leagueStats && (
        <div className={`stats-results ${styles['stats-results']}`}>
          <h3>NBA Team Rankings ({season})</h3>
          <p className={`sort-hint ${styles['sort-hint']}`}>Click on column headers to sort</p>
          
          <StatsTable 
            data={leagueStats} 
            columns={getLeagueColumns()} 
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>
      )}
    </div>
  );
};

export default LeagueStats;
