import React, { useState } from 'react';
import './TeamStats.css';
import StatsTable from './StatsTable';

const TeamStats = () => {
  const [teamInput, setTeamInput] = useState('');
  const [season, setSeason] = useState('2024-25');
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeamStats = async () => {
    if (!teamInput.trim()) {
      setError('Please enter a team name or abbreviation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team-stats?team=${teamInput}&season=${season}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch team stats');
      }

      setTeamStats(data);
    } catch (err) {
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

  return (
    <div className="team-stats-container">
      <h2>Team Statistics</h2>
      
      <div className="search-controls">
        <div className="input-group">
          <label htmlFor="team-input">Team Name or Abbreviation:</label>
          <input
            id="team-input"
            type="text"
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            placeholder="e.g. Lakers or LAL"
          />
        </div>
        
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
          className="search-button"
          onClick={fetchTeamStats}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Stats'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {teamStats && (
        <div className="stats-results">
          <h3>{teamStats.TEAM_NAME} ({season})</h3>
          <div className="team-summary">
            <div className="summary-item">
              <span className="label">Record:</span>
              <span className="value">{teamStats.W}-{teamStats.L}</span>
            </div>
            <div className="summary-item">
              <span className="label">Win %:</span>
              <span className="value">{(teamStats.W_PCT * 100).toFixed(1)}%</span>
            </div>
            <div className="summary-item">
              <span className="label">PPG:</span>
              <span className="value">{teamStats.PTS.toFixed(1)}</span>
            </div>
          </div>
          
          <StatsTable data={[teamStats]} columns={getTeamColumns()} />
        </div>
      )}
    </div>
  );
};

export default TeamStats;
