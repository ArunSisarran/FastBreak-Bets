import React, { useState } from 'react';
import styles from '../styles/App.module.css';
import TeamStats from '../pages/TeamStats';
import PlayerStats from '../pages/PlayerStats';
import LeagueStats from '../pages/LeagueStats';

export default function Home() {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <div className={styles.App}>
      <header className={styles["App-header"]}>
        <h1>FastBreak Bets</h1>
        <div className={styles["tab-container"]}>
          <button 
            className={`${styles["tab-button"]} ${activeTab === 'team' ? styles.active : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Stats
          </button>
          <button 
            className={`${styles["tab-button"]} ${activeTab === 'player' ? styles.active : ''}`}
            onClick={() => setActiveTab('player')}
          >
            Player Stats
          </button>
          <button 
            className={`${styles["tab-button"]} ${activeTab === 'league' ? styles.active : ''}`}
            onClick={() => setActiveTab('league')}
          >
            League Overview
          </button>
        </div>
      </header>
      <main className={styles["App-main"]}>
        {activeTab === 'team' && <TeamStats />}
        {activeTab === 'player' && <PlayerStats />}
        {activeTab === 'league' && <LeagueStats />}
      </main>
    </div>
  );
}
