import React, { useState } from 'react';
import './App.css';
import TeamStats from './Pages/TeamStats';
import PlayerStats from './Pages/PlayerStats';
import LeagueStats from './Pages/LeagueStats';

function App() {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <div className="App">
      <header className="App-header">
        <h1>NBA Stats Explorer</h1>
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Stats
          </button>
          <button 
            className={`tab-button ${activeTab === 'player' ? 'active' : ''}`}
            onClick={() => setActiveTab('player')}
          >
            Player Stats
          </button>
          <button 
            className={`tab-button ${activeTab === 'league' ? 'active' : ''}`}
            onClick={() => setActiveTab('league')}
          >
            League Overview
          </button>
        </div>
      </header>
      <main className="App-main">
        {activeTab === 'team' && <TeamStats />}
        {activeTab === 'player' && <PlayerStats />}
        {activeTab === 'league' && <LeagueStats />}
      </main>
    </div>
  );
}

export default App;
