// Import required modules
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import serveFavicon from "serve-favicon";
import { fileURLToPath } from "url";
import path from "path";
import { apiConfig } from "./utils/apiConfig.js";
import { processGames } from "./utils/games.js";
import { getTeamsMap, getTeamById, getTeamsData } from "./utils/teams.js"; // Import teams.js utilities

// File path setup for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// App and API configuration
const port = 3000;
const app = express();
const API_URL = "https://api-nba-v1.p.rapidapi.com/";

// Serve static files (CSS, JS, etc.) from the "public" folder
app.use(express.static("public"));

// Serve a favicon for the site
app.use(serveFavicon(path.join(__dirname, "public", "favicon.ico")));

// Parse form data sent via POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Set up EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --------------------------------------------------
// ROUTE: Home ("/")
// Displays live games and example players
// --------------------------------------------------
app.get("/", async (req, res) => {
  const idArray = [20, 265, 126, 2584]; // Example player IDs to fetch
  const d = new Date();
  const currYear = d.getFullYear();
  const currMonth = String(d.getMonth() + 1).padStart(2, "0");
  const currDay = String(d.getDate() + 1).padStart(2, "0");

  try {
    // Fetch live games happening today
    const resultGame = await axios.get(
      `${API_URL}games?date=${currYear}-${currMonth}-${currDay}`,
      apiConfig
    );
    const games = resultGame.data.response;

    // Use getTeamsMap from teams.js
    const teamsMap = getTeamsMap();

    // Process games using processGames utility
    const updatedGames = processGames(games, teamsMap);

    // Fetch details for the common players (idArray)
    const playerData = await Promise.all(
      idArray.map(async (id) => {
        const resultComPlayers = await axios.get(
          `${API_URL}players?id=${id}`,
          apiConfig
        );
        return resultComPlayers.data.response[0]; // Return the first response
      })
    );

    // Render the homepage with players and game data
    res.render("index.ejs", {
      comPlayers: playerData,
      currentGames: updatedGames,
    });
  } catch (error) {
    console.error("Error fetching player or game data:", error);
    res.render("index.ejs", {
      comPlayers: [],
      currentGames: [],
      error: "Unable to fetch player or game data.",
    });
  }
});


// --------------------------------------------------
// ROUTE: Player Details ("/api/player-details")
// Fetches details for a specific player and recent game stats
// --------------------------------------------------
app.get("/api/player-details", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Player ID is required" });
  }

  try {
    // Use getTeamsMap from teams.js
    const teamsMap = getTeamsMap();

    // Fetch player statistics for the season
    const response = await axios.get(
      `${API_URL}players/statistics?id=${id}&season=2024`,
      apiConfig
    );
    const allGames = response.data.response;

    if (!allGames.length) {
      return res.json({
        player: {},
        team: {},
        recentGames: [],
        position: "N/A",
      });
    }

    // Extract basic player and team info
    const player = allGames[0].player || {};
    const teamId = allGames[0].team?.id;
    const team = teamsMap[teamId] || {};

    // Extract the player's position from the games
    const playerPosition = allGames.find((game) => game.pos)?.pos || "N/A";

    // Get the 6 most recent games
    const recentGameStats = allGames.slice(-6).reverse();

    // Fetch additional game info (e.g., date) for recent games
    const recentGamesWithDate = await Promise.all(
      recentGameStats.map(async (stat) => {
        const gameId = stat.game.id;
        const gameResponse = await axios.get(
          `${API_URL}games?id=${gameId}`,
          apiConfig
        );
        const gameInfo = gameResponse?.data?.response?.[0];
        const gameDate = gameInfo?.date?.start;

        return {
          date: gameDate || null,
          gameId,
          points: stat.points ?? "N/A",
          minutes: stat.min ?? "N/A",
          rebounds: stat.totReb ?? "N/A",
          assists: stat.assists ?? "N/A",
          steals: stat.steals ?? "N/A",
          blocks: stat.blocks ?? "N/A",
          turnovers: stat.turnovers ?? "N/A",
        };
      })
    );

    // Return data to the client
    res.json({
      player: {
        id: player.id,
        firstname: player.firstname,
        lastname: player.lastname,
      },
      team: {
        name: team.name || "Unknown Team",
        logo: team.logo || "./images/unknown-image.jpg",
      },
      position: playerPosition,
      recentGames: recentGamesWithDate,
    });
  } catch (error) {
    console.error("Error fetching player statistics:", error.message);
    res.status(500).json({ error: "Failed to fetch player statistics" });
  }
});

// --------------------------------------------------
// ROUTE: Team Players ("/teams/:id/players")
// Displays all players on a specific team
// --------------------------------------------------
app.get("/teams/:id/players", async (req, res) => {
  const { id: teamId } = req.params;
  const season = 2024;

  try {
    // Fetch players on the specified team
    const result = await axios.get(
      `${API_URL}players?team=${teamId}&season=${season}`,
      apiConfig // Use apiConfig instead of config
    );
    const players = result.data.response;

    // Read team details from a local file
    const teamsData = getTeamsData(); // Use utility to fetch teams data
    const team = teamsData.find((t) => t.id == teamId);

    if (!team) {
      console.error("Team not found in teams.json");
      throw new Error("Team not found");
    }

    // Render the team players page
    res.render("players/index.ejs", { players, teamName: team.name });
  } catch (error) {
    console.error("Error fetching players data:", error.message);
    res.render("players/index.ejs", {
      players: [],
      teamName: "Unknown Team",
      error: "Unable to fetch players. Please try again.",
    });
  }
});


// --------------------------------------------------
// ROUTE: Teams List ("/teams")
// Displays a list of all teams
// --------------------------------------------------
app.get("/teams", (req, res) => {
  try {
    // Fetch teams using the utility
    const teams = getTeamsData();

    // Render the teams list page
    res.render("teams/index.ejs", { teams });
  } catch (error) {
    console.error("Error reading teams data:", error.message);
    res.render("teams/index.ejs", {
      teams: [],
      error: "Unable to load teams data. Please try again.",
    });
  }
});


// --------------------------------------------------
// ROUTE: Games List ("/games")
// Displays a list of games (placeholder for now)
// --------------------------------------------------
app.get("/games", async (req, res) => {
  res.render("games/index.ejs");
});

// --------------------------------------------------
// ROUTE: Profile ("/profile")
// Displays the user profile (placeholder for now)
// --------------------------------------------------
app.get("/profile", (req, res) => {
  res.render("profile/index.ejs");
});

// --------------------------------------------------
// Start the Server
// --------------------------------------------------
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
