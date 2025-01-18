/*
    This code sets up a centralized configuration for making API 
    requests by loading environment variables from a .env.local file. 
*/
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export const apiConfig = {
  headers: {
    "x-rapidapi-host": process.env.NBA_HOST,
    "x-rapidapi-key": process.env.NBA_KEY,
  },
};
