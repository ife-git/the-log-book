const form = document.getElementById("log-form");
const formMessageText = document.querySelector(".form-message");

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
      form.title.value = note.title;
      form.content.value = note.content;
      form.category.value = note.category;
      form.timestamp.value = new Date(note.timestamp)
        .toISOString()
        .slice(0, 16); // datetime-local format
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

  const readableDate = new Date(isoDateString).toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const data = { title, content, category, timestamp: readableDate };

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

    if (!response.ok)
      throw new Error(`Server responded with ${response.status}`);
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
  } catch (error) {
    console.error("Upload error:", error);
    showMessage("⚠️ Upload failed. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

function showMessage(message, type) {
  formMessageText.textContent = message;
  formMessageText.className = "form-message";
  formMessageText.classList.add(type);
}
