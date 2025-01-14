import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import serveFavicon from "serve-favicon";
import { fileURLToPath } from "url";
import path from "path";
import fs from 'fs'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: ".env.local" });

const port = 3000;
const app = express();
const API_URL = "https://api-nba-v1.p.rapidapi.com/";

app.use(express.static("public"));
app.use(serveFavicon(path.join(__dirname, "public", "favicon.ico")));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure views are resolved properly

const config = {
    headers: {
        "x-rapidapi-host": process.env.NBA_HOST,
        "x-rapidapi-key": process.env.NBA_KEY,
    },
};

// Home Route
// Home Route
app.get("/", async (req, res) => {
    const idArray = [20, 265, 126, 2584]; // Array of player IDs
    const comPlayers = [];

    const d = new Date(); 
    const currYear = d.getFullYear();
    const currMonth = String(d.getMonth() + 1).padStart(2, '0'); // Zero-padded month
    const currDay = String(d.getDate()).padStart(2, '0'); // Zero-padded day
    

  

    try {
        //Live Games
        const resultGame = await axios.get(`${API_URL}games?date=${currYear}-${currMonth}-${currDay}`, config);
        const games = resultGame.data.response;
            console.log(games); 
        
        // Fetch player data for all IDs using Promise.all
        const playerData = await Promise.all(
            idArray.map(async (id) => {
                const resultComPlayers = await axios.get(`${API_URL}players?id=${id}`, config);
                return resultComPlayers.data.response[0]; // Assuming the response is an array
            })
        );

        res.render("index.ejs", { comPlayers: playerData , currentGames : games}); // Pass data as an object
    } catch (error) {
        console.error("Error fetching player data:", error);
        res.render("index.ejs", { comPlayers: [], currentGames: [], error: "Unable to fetch player or game data." });
    }
});


// Players Route
app.get("/teams/:id/players", async (req, res) => {
    const { id: teamId } = req.params; // Get team ID from the URL
    const season = 2024; // Hardcoded or dynamically set season

    try {
        // Fetch player data for the specified team and season
        const result = await axios.get(`${API_URL}players?team=${teamId}&season=${season}`, config);
        const players = result.data.response;

        // Fetch team data from the local teams.json file
        const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "teams.json"), "utf8"));
        const team = teamsData.response.find(t => t.id == teamId);

        if (!team) {
            throw new Error("Team not found");
        }

        // Pass the team name and players data to the template
        res.render("players/index.ejs", { players, teamName: team.name });
    } catch (error) {
        console.error("Error fetching players data:", error);
        res.render("players/index.ejs", { players: [], teamName: "Unknown Team", error: "Unable to fetch players. Please try again." });
    }
});


// Teams Route
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
