import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import nba_utils
import matplotlib.pyplot as plt
import seaborn as sns

def predict_over_under(player_name, point_threshold):
    player_id = nba_utils.get_player_id(player_name)
    if not player_id:
        return f"Player '{player_name}' not found"

    current_season = '2024-25'

