import React, { useState, useEffect } from 'react';
import './LeagueStats.css';
import StatsTable from './StatsTable';

const LeagueStats = () => {
  const [season, setSeason] = useState('2024-25');
  const [leagueStats, setLeagueStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'W_PCT', direction: 'desc' });

  useEffect(() => {
    fetchLeagueStats();
  }, [season]);

  const fetchLeagueStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team-stats/league?season=${season}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch league stats');
      }

      // Sort the data
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
    } catch (err) {
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

  return (
    <div className="league-stats-container">
      <h2>League Overview</h2>
      
      <div className="controls">
        <div className="input-group">
          <label htmlFor="season-input">Season:</label>
          <select
            id="season-input"
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
          className="refresh-button"
          onClick={fetchLeagueStats}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading league data...</div>}

      {leagueStats && (
        <div className="stats-results">
          <h3>NBA Team Rankings ({season})</h3>
          <p className="sort-hint">Click on column headers to sort</p>
          
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
