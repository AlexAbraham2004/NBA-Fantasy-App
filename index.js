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

const config = {
    headers: { Authorization: `${process.env.NBA_AUTHENTICATION}` },
};

app.get('/', async (req,res) => {
    try{
        const playersResponse = await axios.get(API_URL + "players", config);
        const gamesResponse = await axios.get(API_URL + "games", config);
    
        res.render("index.ejs", 
            {
                players: JSON.stringify(playersResponse.data),
                games: JSON.stringify(gamesResponse.data), 
            });
    }catch{
        res.render("index.ejs", 
            {
                players: JSON.stringify(error.response?.data || { error: "Failed to load players" }),
                games: JSON.stringify(error.response?.data || { error: "Failed to load games" }),
            }
        )
        console.log(players);
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
