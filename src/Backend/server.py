import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import nba_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Initialize Flask and set up CORS to allow connections from anywhere
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# Make sure CORS headers are present on all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


# Get all NBA teams
@app.route('/api/teams', methods=['GET'])
def get_all_teams():
    return jsonify(nba_utils.get_all_teams_data())


# Search for players by name
@app.route('/api/players', methods=['GET'])
def search_players():
    search_term = request.args.get('name', '')
    if not search_term:
        return jsonify({"error": "Please provide a name parameter"}), 400

    found_players = nba_utils.search_players_data(search_term)
    return jsonify(found_players)


# Get stats for a specific team
@app.route('/api/team-stats', methods=['GET'])
def get_team_stats():
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


# Get stats for all teams in the league
@app.route('/api/team-stats/league', methods=['GET'])
def get_league_team_stats():
    season = request.args.get('season', '2024-25')

    data = nba_utils.get_league_team_stats_data(season)
    if "error" in data:
        return jsonify({"error": data["error"]}), 500

    return jsonify(data)


# Get stats for a specific player
@app.route('/api/player-stats', methods=['GET'])
def get_player_stats():
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


# Simple endpoint to check if API is working
@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok", "message": "API is working"})


# Start the server when this file is run directly
if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=False, host='0.0.0.0', port=5000)
