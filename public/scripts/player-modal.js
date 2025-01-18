// Wait until the DOM (HTML content) is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Select the modal element
    const modal = document.getElementById("player-modal");

    // Select the close button inside the modal
    const closeModal = document.querySelector(".close-btn");

    // Select elements in the modal where we display player information
    const playerName = document.getElementById("player-name"); // Player's name
    const playerLogo = document.getElementById("player-logo"); // Player's team logo
    const playerTeam = document.getElementById("player-team"); // Player's team name
    const playerPositions = document.getElementById("player-positions"); // Player's positions
    const gameLogBody = document.getElementById("game-log-body"); // Table body for game logs

    // Attach click events to all buttons that open player details
    document.querySelectorAll(".details-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            // Get the player ID from the parent element of the clicked button
            const playerId = event.target.closest(".player-card").getAttribute("data-player-id");
            if (!playerId) {
                console.error("Player ID not found"); // Log an error if the player ID is missing
                return;
            }

            try {
                // Show the modal and reset its content
                modal.style.display = "block";
                playerName.textContent = "Loading..."; // Indicate loading state
                playerLogo.src = ""; // Clear the logo
                playerTeam.textContent = ""; // Clear the team name
                playerPositions.textContent = ""; // Clear the position
                gameLogBody.innerHTML = ""; // Clear the game log table

                // Fetch player details from the server using their ID
                const response = await fetch(`/api/player-details?id=${playerId}`);
                const data = await response.json(); // Convert the response to JSON

                // Populate the modal header with player details
                playerName.textContent = `${data.player.firstname} ${data.player.lastname}`; // Display player's full name
                playerLogo.src = data.team.logo || "./images/unknown-image.jpg"; // Display team logo (or placeholder if missing)
                console.log(data.team.logo);
                playerTeam.textContent = data.team.name; // Display team name

                // Display the player's position (if available)
                playerPositions.textContent = `Position: ${data.position}`; // Set the position text

                // Populate the recent games section
                data.recentGames.forEach((game) => {
                    // Format the game's date to a user-friendly format
                    const formattedDate = formatDate(game.date);

                    // Create a new table row for the game statistics
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${game.points}</td>
                        <td>${game.minutes}</td>
                        <td>${game.rebounds}</td>
                        <td>${game.assists}</td>
                        <td>${game.steals}</td>
                        <td>${game.blocks}</td>
                        <td>${game.turnovers}</td>
                    `;
                    gameLogBody.appendChild(row); // Add the row to the table
                });
            } catch (error) {
                console.error("Error fetching player details:", error); // Log errors if the request fails
                playerName.textContent = "Error loading player details"; // Display error message in modal
            }
        });
    });

    // Close the modal when the close button is clicked
    closeModal.addEventListener("click", () => {
        modal.style.display = "none"; // Hide the modal
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none"; // Hide the modal if clicked outside its content
        }
    });
});

// Function to format ISO date to MM/DD
// This ensures the date is displayed in a user-friendly format
function formatDate(isoDate) {
    if (!isoDate) return "N/A"; // If date is missing, return "N/A"
    const date = new Date(isoDate); // Convert ISO string to JavaScript Date object
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (zero-based, so +1)
    const day = String(date.getDate()).padStart(2, '0'); // Get the day, padded with 0 if needed
    return `${month}/${day}`; // Return date in MM/DD format
}
