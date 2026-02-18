// Replace EventSource with polling
const liveContainer = document.getElementById("live-container");

async function fetchMotivation() {
  try {
    const response = await fetch("/api/motivation");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.motif) {
      liveContainer.textContent = data.motif;
    }
  } catch (err) {
    console.log("Failed to fetch motivation:", err);
    liveContainer.textContent = "✨ Stay curious, keep logging! ✨"; // Fallback message
  }
}

// Fetch immediately
fetchMotivation();

// Then fetch every 10 seconds
setInterval(fetchMotivation, 3000);
