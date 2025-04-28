import time
from nba_api.stats.endpoints import leaguedashteamstats, playerdashboardbygeneralsplits
from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import playergamelog
import pandas as pd


# Adds delay between requests so we dont send too many
def rate_limit():
    time.sleep(0.6)


# Function to get the team ID by name
def get_team_id(team_name):
    team_dict = teams.find_team_by_abbreviation(team_name)
    if not team_dict:
        team_dict = teams.find_teams_by_full_name(team_name)

        if team_dict:
            return team_dict[0]['id']

        return None

    return team_dict['id']


# Function to get the player ID by name
def get_player_id(player_name):
    player_dict = players.find_players_by_full_name(player_name)

    if player_dict:
        return player_dict[0]['id']

    return None


# Function to get all NBA teams
def get_all_teams_data():
    return teams.get_teams()


# Function to seach by players by name
def search_players_data(search_term):
    if not search_term:
        return None

    return players.find_players_by_full_name(search_term)


# Get the team stats by team ID
def get_team_stats_data(team_id, season='2024-25'):
    if not team_id:
        return None

    rate_limit()

    try:
        team_stats = leaguedashteamstats.LeagueDashTeamStats(
            team_id_nullable=team_id,
            season=season,
            per_mode_detailed='PerGame'
        )

        data = team_stats.get_data_frames()[0].to_dict('records')
        return data[0] if data else None

    except Exception as e:
        return {"error": str(e)}


# Function to get all the team stats
def get_league_team_stats_data(season='2024-25'):
    rate_limit()

    try:
        league_stats = leaguedashteamstats.LeagueDashTeamStats(
            season=season,
            per_mode_detailed='PerGame'
        )

        data = league_stats.get_data_frames()[0].to_dict('records')
        return data

    except Exception as e:
        return {"error": str(e)}


# Function to get player stats by Id
def get_player_stats_data(player_id, season='2024-25'):
    if not player_id:
        return None

    rate_limit()
    try:
        player_stats = playerdashboardbygeneralsplits.PlayerDashboardByGeneralSplits(
            player_id=player_id,
            season=season,
            per_mode_detailed='PerGame'
        )

        data = player_stats.get_data_frames()[0].to_dict('records')
        return data[0] if data else None

    except Exception as e:
        return {"error": str(e)}


# Function to get player game logs
def get_player_game_logs(player_id, season='2024-25'):

    if not player_id:
        return None
    rate_limit()
    try:
        game_log = playergamelog.PlayerGameLog(
            player_id=player_id,
            season=season,
            season_type_all_star='Regular Season'
        )
        data = game_log.get_data_frames()[0]
        if 'MIN' in data.columns:
            data['MIN'] = data['MIN'].apply(lambda x:
                           float(x.split(':')[0]) + float(x.split(':')[1])/60 
                           if ':' in str(x) else float(x))
        if 'GAME_DATE' in data.columns:
            data['GAME_DATE'] = pd.to_datetime(data['GAME_DATE'])

        return data

    except Exception as e:
        return {"error": str(e)}

# Function to get historical over/under results
def get_player_over_under_history(player_id, point_threshold, season='2024-25'):

    game_logs = get_player_game_logs(player_id, season)
    if game_logs is None or isinstance(game_logs, dict):
        return {"error": "Could not retrieve game logs"}

    over_count = sum(game_logs['PTS'] >= point_threshold)
    total_games = len(game_logs)

    home_games = game_logs[game_logs['MATCHUP'].str.contains(' vs. ')]
    away_games = game_logs[~game_logs['MATCHUP'].str.contains(' vs. ')]

    home_over_count = sum(home_games['PTS'] >= point_threshold)
    away_over_count = sum(away_games['PTS'] >= point_threshold)

    return {
        "over_count": over_count,
        "under_count": total_games - over_count,
        "total_games": total_games,
        "over_rate": over_count / total_games if total_games > 0 else 0,
        "home_over_rate": home_over_count / len(home_games) if len(home_games) > 0 else 0,
        "away_over_rate": away_over_count / len(away_games) if len(away_games) > 0 else 0,
        "avg_points": game_logs['PTS'].mean(),
        "median_points": game_logs['PTS'].median(),
        "std_points": game_logs['PTS'].std()
    }


# Function to extract opponent team from matchup
def extract_opponent(matchup_str):

    if ' vs. ' in matchup_str:
        return matchup_str.split(' vs. ')[1]
    elif ' @ ' in matchup_str:
        return matchup_str.split(' @ ')[1]
    else:
        return None


# Function to get opponent defensive rating
def get_opponent_defensive_rating(game_logs):

    df = game_logs.copy()

    df['OPPONENT'] = df['MATCHUP'].apply(extract_opponent)

    df['OPP_DEF_RTG'] = 0.0
    for idx, row in df.iterrows():
        try:
            opponent_id = get_team_id(row['OPPONENT'])
            if opponent_id:
                opponent_stats = get_team_stats_data(opponent_id)
                if opponent_stats and 'DEF_RATING' in opponent_stats:
                    df.loc[idx, 'OPP_DEF_RTG'] = opponent_stats['DEF_RATING']
        except:
            pass

    return df


# Function to create features for player scoring model
def create_player_scoring_features(game_logs, windows=[3, 5, 10]):

    if len(game_logs) < max(windows):
        return None

    game_logs = game_logs.sort_values('GAME_DATE')

    features = pd.DataFrame(index=game_logs.index)

    features['is_home'] = (game_logs['MATCHUP'].str.contains(' vs. ')).astype(int)

    if 'OPP_DEF_RTG' in game_logs.columns:
        features['opp_def_rtg'] = game_logs['OPP_DEF_RTG']

    for window in windows:
        if len(game_logs) >= window:
            features[f'pts_last_{window}'] = game_logs['PTS'].rolling(window).mean().shift(1)
            features[f'pts_std_last_{window}'] = game_logs['PTS'].rolling(window).std().shift(1)

            features[f'fga_last_{window}'] = game_logs['FGA'].rolling(window).mean().shift(1)
            features[f'fg_pct_last_{window}'] = game_logs['FG_PCT'].rolling(window).mean().shift(1)

            if 'FG3A' in game_logs.columns and 'FG3_PCT' in game_logs.columns:
                features[f'fg3a_last_{window}'] = game_logs['FG3A'].rolling(window).mean().shift(1)
                features[f'fg3_pct_last_{window}'] = game_logs['FG3_PCT'].rolling(window).mean().shift(1)

            if 'MIN' in game_logs.columns:
                features[f'min_last_{window}'] = game_logs['MIN'].rolling(window).mean().shift(1)

    features_clean = features.dropna()

    return features_clean
