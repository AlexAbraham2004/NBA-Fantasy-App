import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import serveFavicon from "serve-favicon";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: ".env.local" });

const port = 3000;
const app = express();
const API_URL = "https://api.balldontlie.io/v1/";

app.use(express.static("public"));
app.use(serveFavicon(path.join(__dirname, "public", "favicon.ico")));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure views are resolved properly

const config = {
    headers: { Authorization: `${process.env.NBA_AUTHENTICATION}` },
};

// Home Route
app.get("/", async (req, res) => {
    try {
        const playersResponse = await axios.get(API_URL + "players", config);
        const gamesResponse = await axios.get(API_URL + "games", config);

        res.render("index.ejs", {
            players: playersResponse.data.data,
            games: gamesResponse.data.data,
        });
    } catch (error) {
        res.render("index.ejs", {
            players: { error: "Failed to load players" },
            games: { error: "Failed to load games" },
        });
        console.error(error.message);
    }
});

// Players Route
app.get("/players", async (req, res) => {
    try {
        const { name, position, height, draftYear } = req.query;
        const response = await axios.get(API_URL + "players", config);
        let players = response.data.data;

        // Filter players by search criteria
        if (name) {
            players = players.filter(player =>
                (player.first_name + " " + player.last_name)
                    .toLowerCase()
                    .includes(name.toLowerCase())
            );
        }
        if (position) {
            players = players.filter(player =>
                player.position.toLowerCase() === position.toLowerCase()
            );
        }
        if (height) {
            players = players.filter(player => player.height === height);
        }
        if (draftYear) {
            players = players.filter(player => player.draft_year == draftYear);
        }

        res.render("players/index.ejs", { players });
    } catch (error) {
        console.error(error.message);
        res.render("players/index.ejs", { players: { error: "Failed to load players" } });
    }
});

// Games Route
app.get("/games", async (req, res) => {
    try {
        const response = await axios.get(API_URL + "games", config);
        const games = response.data.data;

        res.render("games/index.ejs", { games });
    } catch (error) {
        console.error(error.message);
        res.render("games/index.ejs", { games: { error: "Failed to load games" } });
    }
});

// Profile Route
app.get("/profile", (req, res) => {
    res.render("profile/index.ejs");
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
