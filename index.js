import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import serveFavicon from "serve-favicon";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: ".env.local" });

const port = 3000;
const app = express();
const API_URL = "https://api-nba-v1.p.rapidapi.com/";

// Serve static files from "public" folder
app.use(express.static("public"));

// Serve favicon
app.use(serveFavicon(path.join(__dirname, "public", "favicon.ico")));

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set up EJS for templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// RapidAPI configuration (NBA host/key)
const config = {
  headers: {
    "x-rapidapi-host": process.env.NBA_HOST,
    "x-rapidapi-key": process.env.NBA_KEY,
  },
};

// Home Route
app.get("/", async (req, res) => {
  const idArray = [20, 265, 126, 2584]; // Example player IDs
  const d = new Date();
  const currYear = d.getFullYear();
  const currMonth = String(d.getMonth() + 1).padStart(2, "0");
  const currDay = String(d.getDate() + 1).padStart(2, "0");

  try {
    // Fetch live games for today's date
    const resultGame = await axios.get(`${API_URL}games?date=${currYear}-${currMonth}-${currDay}`, config);
    const games = resultGame.data.response;

    // Sort games by status
    const sortedGames = games.sort((a, b) => {
      const statusOrder = { "In Play": 1, "Scheduled": 2, "Finished": 3 };
      return statusOrder[a.status.long] - statusOrder[b.status.long];
    });

    // Fetch common player data
    const playerData = await Promise.all(
      idArray.map(async (id) => {
        const resultComPlayers = await axios.get(`${API_URL}players?id=${id}`, config);
        // Return first match for each ID
        return resultComPlayers.data.response[0];
      })
    );

    // Render homepage with players + live games
    res.render("index.ejs", {
      comPlayers: playerData,
      currentGames: sortedGames,
    });
  } catch (error) {
    console.error("Error fetching player data:", error);
    res.render("index.ejs", {
      comPlayers: [],
      currentGames: [],
      error: "Unable to fetch player or game data.",
    });
  }
});

app.get("/api/player-details", async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Player ID is required" });
    }

    try {
        const response = await axios.get(`${API_URL}players/statistics?id=${id}&season=2024`, config);
        const allGames = response.data.response;

        if (!allGames.length) {
            return res.json({
                player: {},
                team: {},
                recentGames: [],
                position: "N/A", // Default if no games
            });
        }

        // Extract player & team info
        const player = allGames[0].player || {};
        const team = allGames[0].team || {};

        // Find the first valid `pos` field in the games array
        const playerPosition = allGames.find(game => game.pos)?.pos || "N/A";

        // Get the 6 most recent games
        const recentGameStats = allGames.slice(-6).reverse();

        // Fetch game dates for recent games
        const recentGamesWithDate = await Promise.all(
            recentGameStats.map(async (stat) => {
                const gameId = stat.game.id;
                const gameResponse = await axios.get(`${API_URL}games?id=${gameId}`, config);
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

        res.json({
            player: {
                id: player.id,
                firstname: player.firstname,
                lastname: player.lastname,
            },
            team: {
                name: team.name,
                logo: team.logo,
            },
            position: playerPosition, // Include the position
            recentGames: recentGamesWithDate,
        });
    } catch (error) {
        console.error("Error fetching player statistics:", error.message);
        res.status(500).json({ error: "Failed to fetch player statistics" });
    }
});

// Route for listing all players on a given team
app.get("/teams/:id/players", async (req, res) => {
  const { id: teamId } = req.params;
  const season = 2024;

  try {
    console.log(`Fetching players for team ID: ${teamId} and season: ${season}`);
    const result = await axios.get(`${API_URL}players?team=${teamId}&season=${season}`, config);
    const players = result.data.response;

    // Also read local teams.json for team name
    const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "teams.json"), "utf8"));
    const team = teamsData.response.find((t) => t.id == teamId);
    if (!team) {
      console.error("Team not found in teams.json");
      throw new Error("Team not found");
    }

    res.render("players/index.ejs", { players, teamName: team.name });
  } catch (error) {
    console.error("Error fetching players data:", error.message || error);
    res.render("players/index.ejs", {
      players: [],
      teamName: "Unknown Team",
      error: "Unable to fetch players. Please try again.",
    });
  }
});

// Route for listing teams (reads local teams.json)
app.get("/teams", (req, res) => {
  try {
    const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "teams.json"), "utf8"));
    const teams = teamsData.response;
    res.render("teams/index.ejs", { teams });
  } catch (error) {
    console.error("Error reading teams data:", error);
    res.render("teams/index.ejs", { teams: [], error: "Unable to load teams data. Please try again." });
  }
});

// Games Route
app.get("/games", async (req, res) => {
  res.render("games/index.ejs");
});

// Profile Route
app.get("/profile", (req, res) => {
  res.render("profile/index.ejs");
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
