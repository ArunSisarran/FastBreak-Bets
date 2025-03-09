import '../styles/index.css';  
import '../styles/TeamStats.module.css'
import '../styles/StatsTable.module.css'
import '../styles/LeagueStats.module.css'
import '../styles/PlayerStats.module.css'
import Head from 'next/head'  

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>FastBreak Bets</title>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="description" content="Make informed sports betting decisions by with real-time NBA data and AI-generated betting parlays." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
