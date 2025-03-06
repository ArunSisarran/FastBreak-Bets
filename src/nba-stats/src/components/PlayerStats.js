import React, { useState } from 'react';
import './PlayerStats.css';
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
      const response = await fetch(`/api/player-stats?player=${playerInput}&season=${season}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch player stats');
      }

      setPlayerStats(data);
    } catch (err) {
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
    <div className="player-stats-container">
      <h2>Player Statistics</h2>
      
      <div className="search-controls">
        <div className="input-group">
          <label htmlFor="player-input">Player Name:</label>
          <input
            id="player-input"
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="e.g. LeBron James"
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
          onClick={fetchPlayerStats}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Stats'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {playerStats && (
        <div className="stats-results">
          <h3>{playerStats.PLAYER_NAME} ({season})</h3>
          <div className="player-summary">
            <div className="summary-item">
              <span className="label">Team:</span>
              <span className="value">{playerStats.TEAM_ABBREVIATION}</span>
            </div>
            <div className="summary-item">
              <span className="label">PPG:</span>
              <span className="value">{playerStats.PTS.toFixed(1)}</span>
            </div>
            <div className="summary-item">
              <span className="label">RPG:</span>
              <span className="value">{playerStats.REB.toFixed(1)}</span>
            </div>
            <div className="summary-item">
              <span className="label">APG:</span>
              <span className="value">{playerStats.AST.toFixed(1)}</span>
            </div>
          </div>
          
          <StatsTable data={[playerStats]} columns={getPlayerColumns()} />
        </div>
      )}
    </div>
  );
};

export default PlayerStats;
