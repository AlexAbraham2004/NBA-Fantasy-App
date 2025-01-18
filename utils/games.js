/*
    Processes game data by enriching it with additional team information 
    from a preloaded teamsMap and sorts the games by their status. 
    And replaces team logos with corrected versions from teamsMap. Ensures the 
    data is accurate. The sorting logic orders based on their current status, 
    (live, scheduled, or finished games). 
*/

// Function to process game data by enriching it with team details and sorting
export const processGames = (games, teamsMap) => {
    // Map over the games to update and enrich team information
    return games
      .map((game) => {
        // Fetch home and visitor teams from the teamsMap using their IDs
        const homeTeam = teamsMap[game.teams.home.id];
        const visitorTeam = teamsMap[game.teams.visitors.id];
  
        // Replace the home team's logo if available in the teamsMap
        if (homeTeam) {
          game.teams.home.logo = homeTeam.logo;
        }
  
        // Replace the visitor team's logo if available in the teamsMap
        if (visitorTeam) {
          game.teams.visitors.logo = visitorTeam.logo;
        }
  
        // Return the updated game object
        return game;
      })
      // Sort the games by their status: In Play, Scheduled, Finished
      .sort((a, b) => {
        const statusOrder = { "In Play": 1, "Scheduled": 2, "Finished": 3 };
        return statusOrder[a.status.long] - statusOrder[b.status.long];
      });
  };
  