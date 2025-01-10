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
app.get("/", async (req, res) => {
    res.render("index.ejs");
});

// Players Route
app.get("/players", async (req, res) => {
    res.render("players/index.ejs");
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
