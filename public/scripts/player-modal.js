document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("player-modal");
    const closeModal = document.querySelector(".close-btn");
    const playerName = document.getElementById("player-name");
    const playerLogo = document.getElementById("player-logo");
    const playerTeam = document.getElementById("player-team");
    const playerPositions = document.getElementById("player-positions");
    const gameLogBody = document.getElementById("game-log-body");

    document.querySelectorAll(".details-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const playerId = event.target.closest(".player-card").getAttribute("data-player-id");
            if (!playerId) {
                console.error("Player ID not found");
                return;
            }

            try {
                modal.style.display = "block";
                playerName.textContent = "Loading...";
                playerLogo.src = "";
                playerTeam.textContent = "";
                playerPositions.textContent = "";
                gameLogBody.innerHTML = "";

                // Fetch player details
                const response = await fetch(`/api/player-details?id=${playerId}`);
                const data = await response.json();

                // Populate modal header
                playerName.textContent = `${data.player.firstname} ${data.player.lastname}`;
                playerLogo.src = data.team.logo || "/images/placeholder.png";
                playerTeam.textContent = data.team.name;

                // Display the position
                playerPositions.textContent = `Position: ${data.position}`;

            // Populate recent games
            data.recentGames.forEach((game) => {
                const formattedDate = formatDate(game.date); // Format the date
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
                gameLogBody.appendChild(row);
            });
            } catch (error) {
                console.error("Error fetching player details:", error);
                playerName.textContent = "Error loading player details";
            }
        });
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

// Function to format ISO date to MM/DD/YYYY
function formatDate(isoDate) {
    if (!isoDate) return "N/A"; // Handle missing date
    const date = new Date(isoDate); // Parse the ISO date
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`; // Format as MM/DD/YYYY
}
