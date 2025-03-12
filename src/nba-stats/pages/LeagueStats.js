'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/LeagueStats.module.css';
import StatsTable from './StatsTable';
import { apiUrl, checkLocalBackendStatus } from '../lib/apiConfig';

const LeagueStats = () => {
  const [season, setSeason] = useState('2024-25');
  const [leagueStats, setLeagueStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'W_PCT', direction: 'desc' });
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    // Initial backend check
    checkBackendStatus();
    
    // Keep checking if the backend is running
    const intervalId = setInterval(checkBackendStatus, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Get fresh data when season changes or backend comes online
    if (backendStatus === 'running') {
      fetchLeagueStats();
    }
  }, [season, backendStatus]);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    const isRunning = await checkLocalBackendStatus();
    console.log('Backend status check result (LeagueStats):', isRunning);
    setBackendStatus(isRunning ? 'running' : 'not-running');
  };

  const fetchLeagueStats = async () => {
    if (backendStatus !== 'running') {
      console.log('Not fetching - backend not running');
      setError('Local backend server is not running. Please start the server and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const endpoint = `/api/team-stats/league?season=${season}`;
      const url = apiUrl(endpoint);
      console.log(`Fetching league data from: ${url}`);
      
      const response = await fetch(url, {
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
    <div className={`league-stats-container ${styles['league-stats-container']}`}>
      <h2>League Overview</h2>
      
      <div className={styles['center-container']}>
        {renderBackendStatus()}
      </div>
      
      <div className={styles['center-container']}>
        <div className={styles['controls-container']}>
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
            className={styles['refresh-button']}
            onClick={fetchLeagueStats}
            disabled={loading || backendStatus !== 'running'}
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
