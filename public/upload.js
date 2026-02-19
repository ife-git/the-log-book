const form = document.getElementById("log-form");
const formMessageText = document.querySelector(".form-message");

// Helper function to parse different timestamp formats
function parseTimestampToDateTimeLocal(timestamp) {
  try {
    // Try to parse the timestamp
    const date = new Date(timestamp);

    // Check if it's valid
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 16);
    }

    // If it's in format "7 January 2025 at 09:30"
    const match = timestamp.match(/(\d+) (\w+) (\d+) at (\d+):(\d+)/);
    if (match) {
      const [_, day, month, year, hour, minute] = match;
      const monthMap = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
      };
      const date = new Date(year, monthMap[month], day, hour, minute);
      return date.toISOString().slice(0, 16);
    }

    return "";
  } catch (e) {
    console.error("Error parsing timestamp:", e);
    return "";
  }
}

// Check if editing on page load
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

if (editId) {
  window.editNoteId = editId;
  form.querySelector("button[type='submit']").textContent = "Update Entry";
  fetch("/api")
    .then((res) => res.json())
    .then((notes) => {
      const note = notes.find((n) => n.id === editId);
      if (!note) return;

      form.title.value = note.title || "";
      form.content.value = note.content || "";
      form.category.value = note.category || "learning";

      // Safely handle timestamp
      if (note.timestamp) {
        form.timestamp.value = parseTimestampToDateTimeLocal(note.timestamp);
      }

      form.querySelector("button[type='submit']").textContent = "Update Entry";
    })
    .catch((err) => console.error("Failed to load note for edit:", err));
}

// Submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = form.title.value.trim();
  const content = form.content.value.trim();
  const category = form.category.value;
  const isoDateString = form.timestamp.value;
  const submitBtn = form.querySelector("button[type='submit']");

  if (!title || !content || !category || !isoDateString) {
    showMessage("Please complete all fields.", "error");
    return;
  }

  // Create both timestamp formats
  const dateObj = new Date(isoDateString);
  const readableDate = dateObj
    .toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", " at");

  // Store ISO version for backend consistency
  const isoDate = dateObj.toISOString();

  // Send both formats - backend can decide which to use
  const data = {
    title,
    content,
    category,
    timestamp: readableDate, // Keep original format for display
    isoDate: isoDate, // Add ISO for consistency
  };

  const url = window.editNoteId ? `/api/${window.editNoteId}` : "/api";
  const method = window.editNoteId ? "PUT" : "POST";

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = method === "PUT" ? "Updating..." : "Uploading...";
    showMessage(
      method === "PUT" ? "Updating note..." : "Uploading note...",
      "info",
    );

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server responded with ${response.status}`,
      );
    }

    await response.json();

    showMessage(
      method === "PUT"
        ? "✅ Note updated successfully!"
        : "✅ Note uploaded successfully!",
      "success",
    );

    form.reset();
    submitBtn.textContent = "Add Entry";
    window.editNoteId = null;

    // Optional: Redirect to notes page after successful upload
    // setTimeout(() => { window.location.href = '/notes.html'; }, 1500);
  } catch (error) {
    console.error("Upload error:", error);
    showMessage(`⚠️ Upload failed: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

function showMessage(message, type) {
  formMessageText.textContent = message;
  formMessageText.className = "form-message";
  formMessageText.classList.add(type);
}
