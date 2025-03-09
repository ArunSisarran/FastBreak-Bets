import time
from nba_api.stats.endpoints import leaguedashteamstats, playerdashboardbygeneralsplits
from nba_api.stats.static import teams, players
import pandas


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
