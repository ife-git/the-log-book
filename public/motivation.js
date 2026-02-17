const eventSource = new EventSource("/api/motivation");

const liveContainer = document.getElementById("live-container");

// Handle live price updates
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const motif = data.motif;
  liveContainer.textContent = motif;
};

// Handle connection loss
eventSource.onerror = () => {
  console.log("Connection lost. Attempting to reconnect...");
};
