# NBA Fantasy App

## Overview
The **NBA Fantasy App** is a full-stack web application designed for basketball enthusiasts to view team rosters and player statistics. Users can explore NBA teams by conference, view players' details by team, and enjoy a seamless and interactive experience.

## Features
- **Team Listing**: Displays all NBA teams grouped by conference (East and West).
- **Player Search**: View players from a specific team for the 2024 season.
- **Dynamic Routing**: Navigate to specific team rosters via dynamically generated routes.
- **API Integration**: Fetch real-time player data using the NBA API.

## Technologies Used
- **Frontend**: EJS, CSS (global and modular styling)
- **Backend**: Node.js, Express.js
- **Data Handling**: Axios, File System (fs)
- **Environment Configuration**: dotenv

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nba-fantasy-app.git
   ```
2. Navigate to the project directory:
   ```
   cd nba-fantasy-app
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env.local` file and add your API keys:
   ```env
   NBA_HOST=your-rapidapi-host
   NBA_KEY=your-rapidapi-key
   ```
5. Start the server:
   ```
    nodemon index.js
   ```

6. Open your browser and go to `http://localhost:3000`.

## Usage

1. **View Teams**: Visit the `/teams` route to see a list of all NBA teams grouped by conference.
2. **View Players**: Click on any team to view its roster for the 2024 season.
3. **Dynamic URLs**: Each team has a unique route in the format `/teams/:id/players` to display its players.

## API Reference

This project uses the [NBA API](https://rapidapi.com/api-sports/api/api-nba/) to fetch real-time player data. Ensure you have the correct `NBA_HOST` and `NBA_KEY` set in your `.env.local` file.

## Scripts
- `nodemon index.js`: Starts the application.

## Future Enhancements
- Add player statistics for individual games.
- Include team performance analytics.
- Implement user authentication for personalized features (e.g., saving favorite teams/players).
- Add a search bar for finding players by name.

## License
This project is licensed under the MIT License.

## Author
Developed by Alex Abraham. Feel free to contribute to the project or reach out for collaboration!

