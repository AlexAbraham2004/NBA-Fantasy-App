import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv"

dotenv.config({path: '.env.local'});

const port = 3000; 
const app = express(); 
const API_URL = "https://api.balldontlie.io/v1/"

app.use(express.static("public"));
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

app.post("/get-games", async (req, res) => {
    console.log(req.body.id)

    const searchId = req.body.id; 
    try{
        const result = await axios.get(API_URL + "games?" + searchId, config)
        res.render("index.ejs", {content: JSON.stringify(result.data)});
    }catch{
        res.render("index.ejs", {content: JSON.stringify(error.response.data)})
    }
});

app.post("/get-players", async (req, res) => {
    console.log(req.body.id)
    const searchId = req.body.id; 
    try{
        const result = await axios.get(API_URL + "players?" + searchId, config)
        res.render("index.ejs", {content: JSON.stringify(result.data)});
    }catch{
        res.render("index.ejs", {content: JSON.stringify(error.response.data)})
    }
});



app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
  