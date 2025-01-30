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
    const playerPositions = document.getElementById("player-positions"); // Player's position
    const playerJersey = document.getElementById("player-jersey"); // Jersey number element
    const gameLogBody = document.getElementById("game-log-body"); // Table body for game logs

    // Attach click events to all buttons that open player details
    document.querySelectorAll(".details-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            // Get player data from the player card element
            const playerCard = event.target.closest(".player-card");
            const playerId = playerCard.getAttribute("data-player-id");
            const jerseyNumber = playerCard.getAttribute("data-jersey"); // Get jersey number

            if (!playerId) {
                console.error("Player ID not found");
                return;
            }

            // Show the modal and reset its content
            modal.style.display = "block";
            playerName.textContent = playerCard.querySelector(".player-name").textContent;
            playerLogo.src = ""; // You may need to update this if the logo is available in the card
            playerTeam.textContent = ""; // Update this if team info is also available
            playerPositions.textContent = ""; // Update if position is available
            playerJersey.textContent = `Jersey: ${jerseyNumber || "N/A"}`; // Assign jersey number

            // Clear the game log table (if needed)
            gameLogBody.innerHTML = "";

            try {

                // Fetch only the necessary player details (excluding jersey number)
                const response = await fetch(`/api/player-details?id=${playerId}`);
                const data = await response.json();

                // Populate the modal with the remaining player details
                playerLogo.src = data.team.logo || "/images/unknown-image.jpg"; // Display team logo (or placeholder)
                playerTeam.textContent = data.team.name; // Display team name
                playerPositions.textContent = `Position: ${data.position || "N/A"}`; // Set the position text

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
                console.error("Error fetching player details:", error);
                playerName.textContent = "Error loading player details";
            }
        });
    });

    // Close the modal when the close button is clicked
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

// Function to format ISO date to MM/DD
function formatDate(isoDate) {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}
