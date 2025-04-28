import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import nba_utils
import matplotlib.pyplot as plt
import seaborn as sns


def predict_over_under(player_name, point_threshold, is_home=True):
    player_id = nba_utils.get_player_id(player_name)
    if not player_id:
        return f"Player '{player_name}' not found"

    current_season = '2024-25'
    game_logs = nba_utils.get_player_game_logs(player_id, current_season)

    if game_logs is None or isinstance(game_logs, dict) and "error" in game_logs:
        return "Error getting game logs"

    if len(game_logs) < 20:
        return "Not enough data"
    elif len(game_logs) > 20:
        game_logs = game_logs.sort_values('GAME_DATE', ascending=False).head(20)
        game_logs = game_logs.sort_values('GAME_DATE', ascending=True)

    features = pd.DataFrame()
    features['is_home'] = (game_logs['MATCHUP'].str.contains(' vs. ')).astype(int)

    for window in [3, 5]:
        features[f'pts_last_{window}'] = game_logs['PTS'].rolling(window).mean().shift(1)
        features[f'pts_std_last_{window}'] = game_logs['PTS'].rolling(window).std().shift(1)
        features[f'fga_last_{window}'] = game_logs['FGA'].rolling(window).mean().shift(1)
        features[f'fg_pct_last_{window}'] = game_logs['FG_PCT'].rolling(window).mean().shift(1)
        features[f'fg3_pct_last_{window}'] = game_logs['FG3_PCT'].rolling(window).mean().shift(1)
        features[f'min_last_{window}'] = game_logs['MIN'].rolling(window).mean().shift(1)
    features = features.dropna()

    game_logs = game_logs.loc[features.index]
    target = (game_logs['PTS'] >= point_threshold).astype(int)

    X = features.values
    y = target.values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=5, random_state=42, shuffle=False)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(random_state=42, class_weight='balanced')
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)

    importance = pd.DataFrame({
        'Feature': features.columns,
        'Importance': np.abs(model.coef_[0])
    }).sort_values('Importance', ascending=False)

    recent_games = game_logs.iloc[-5:]

    next_game_features = pd.DataFrame(index=[0])
    next_game_features['is_home'] = 1 if is_home else 0

    for window in [3, 5]:
        if len(recent_games) >= window:
            next_game_features[f'pts_last_{window}'] = recent_games['PTS'].tail(window).mean()
            next_game_features[f'pts_std_last_{window}'] = recent_games['PTS'].tail(window).std()
            next_game_features[f'fga_last_{window}'] = recent_games['FGA'].tail(window).mean()
            next_game_features[f'fg_pct_last_{window}'] = recent_games['FG_PCT'].tail(window).mean()
            next_game_features[f'fg3_pct_last_{window}'] = recent_games['FG3_PCT'].tail(window).mean()
            next_game_features[f'min_last_{window}'] = recent_games['MIN'].tail(window).mean()

    next_game_scaled = scaler.transform(next_game_features)
    prediction = model.predict(next_game_scaled)[0]
    probability = model.predict_proba(next_game_scaled)[0][1]

    result = {
        'player': player_name,
        'point_threshold': point_threshold,
        'recent_games': recent_games[['GAME_DATE', 'MATCHUP', 'PTS']].to_dict('records'),
        'model_accuracy': accuracy,
        'prediction': 'OVER' if prediction == 1 else 'UNDER',
        'probability': probability,
        'feature_importance': importance.to_dict('records'),
        'recent_avg': recent_games['PTS'].mean(),
        'historical_over_rate': (game_logs['PTS'] >= point_threshold).mean()
    }
    return result
