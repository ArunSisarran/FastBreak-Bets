import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import nba_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "fast-break-bets.vercel.app"
]}}, supports_credentials=True)


@app.route('/api/teams', methods=['GET'])
def get_all_teams():
    """Get list of all NBA teams"""
    return jsonify(nba_utils.get_all_teams_data())


@app.route('/api/players', methods=['GET'])
def search_players():
    search_term = request.args.get('name', '')
    if not search_term:
        return jsonify({"error": "Please provide a name parameter"}), 400

    found_players = nba_utils.search_players_data(search_term)
    return jsonify(found_players)


@app.route('/api/team-stats', methods=['GET'])
def get_team_stats():
    """Get team stats by team name/abbreviation"""
    team_name = request.args.get('team', '')
    season = request.args.get('season', '2024-25')

    if not team_name:
        return jsonify({"error": "Please provide a team parameter"}), 400

    team_id = nba_utils.get_team_id(team_name)
    if not team_id:
        return jsonify({"error": f"Team '{team_name}' not found"}), 404

    data = nba_utils.get_team_stats_data(team_id, season)
    if not data:
        return jsonify({"error": "No stats available for this team"}), 404

    if "error" in data:
        return jsonify(data), 500

    return jsonify(data)


@app.route('/api/team-stats/league', methods=['GET'])
def get_league_team_stats():
    """Get stats for all teams"""
    season = request.args.get('season', '2024-25')

    data = nba_utils.get_league_team_stats_data(season)
    if "error" in data:
        return jsonify({"error": data["error"]}), 500

    return jsonify(data)


@app.route('/api/player-stats', methods=['GET'])
def get_player_stats():
    """Get player stats by player name"""
    player_name = request.args.get('player', '')
    season = request.args.get('season', '2024-25')

    if not player_name:
        return jsonify({"error": "Please provide a player parameter"}), 400

    player_id = nba_utils.get_player_id(player_name)
    if not player_id:
        return jsonify({"error": f"Player '{player_name}' not found"}), 404

    data = nba_utils.get_player_stats_data(player_id, season)
    if not data:
        return jsonify({"error": "No stats available for this player"}), 404

    if "error" in data:
        return jsonify({"error": data["error"]}), 500

    return jsonify(data)


@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok", "message": "API is working"})


if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
