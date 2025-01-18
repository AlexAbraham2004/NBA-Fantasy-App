/*
    Handling NBA teams' data. Allow for reading, parsing, and managing the teams.json
    data file. Allow for fetching all teams, creating a mapped structure for 
    quick lookups, and retrieving specific teams by their ID.
*/

// Import necessary modules for file operations and path management in ES modules
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES module compatibility
// __dirname is not natively available in ES modules, so we define it manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fetch all team data from teams.json
// Reads and parses the file, providing the 'response' array of team objects
export const getTeamsData = () => {
  try {
    const teamsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/teams.json"), "utf8") // Read and parse the JSON file
    );
    return teamsData.response; // Return the list of teams
  } catch (error) {
    throw new Error("Failed to read or parse teams.json"); // Handle file read or parse errors
  }
};

// Function to create a map of team IDs to team objects
// Useful for quick lookups by team ID
export const getTeamsMap = () => {
  const teams = getTeamsData(); // Fetch all teams
  return teams.reduce((map, team) => {
    map[team.id] = team; // Map each team ID to its corresponding team object
    return map;
  }, {});
};

// Function to fetch a specific team by its ID
// Returns the team object that matches the provided ID
export const getTeamById = (id) => {
  const teams = getTeamsData(); // Fetch all teams
  return teams.find((team) => team.id === parseInt(id, 10)); // Find the team with the matching ID
};
