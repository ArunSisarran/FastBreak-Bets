# FastBreak Bets

FastBreak Bets is a sports betting assistant that uses the NBA API to fetch up-to-date information about user-specified teams and players to generate more accurate betting parlays. The project combines a Flask backend with a React frontend and integrates a machine learning model to suggest betting parlays based on previous game data.

## Features

- Fetch real-time NBA data using the `nba_api`
- Search for players and teams through the frontend interface
- View current league standings
- Machine learning model to generate:
  - Likely parlay (safe bet)
  - Risky parlay (high potential reward)

## Tech Stack

### Backend

- Flask
- nba\_api
- Scikit-learn (Machine Learning)

### Frontend

- React
- Next.js
- Vercel
- npm
- CSS

## Installation

### Prerequisites

- Python 3.x
- Node.js (npm)
- Virtual Environment (optional but recommended)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ArunSisarran/FastBreakBets.git
   cd FastBreakBets
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Linux/MacOS
   venv\Scripts\activate    # For Windows
   pip install -r requirements.txt
   ```
3. Run the Flask backend:
   ```bash
   cd src/Backend/
   python server.py
   ```

## Usage

1. Access the frontend at `http://localhost:5000`
2. Search for players or teams using the search bar
3. View league standings
4. Generate likely or risky parlays based on past game data

## Machine Learning

The machine learning model uses historical game data to predict possible parlays. The model is trained using Scikit-learn and includes:

- Feature selection for player performance metrics
- Random Forest Classifier
- Logistic Regression

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the Apache-2.0 license.

## Contact

For any inquiries, please contact arunsisarran@gmail.com.

 
