async function loadNotes() {
  try {
    const res = await fetch("/api");
    const notes = await res.json();
    renderCards(notes);
  } catch (err) {
    console.error("Failed to load notes:", err);
  }
}

function renderCards(notes) {
  const container = document.querySelector(".cards-container");

  container.innerHTML = notes
    .map(
      (note) => `
      <article class="note-card">
        <p class="card-details">${note.timestamp}</p>
        <h3>${note.title}</h3>
        <div class="note-text-wrapper">
          <p class="note-text">${note.content}</p>
        </div>
        <div class="note-actions">
          <button class="read-more-btn">Read More</button>
          <button class="edit-btn" data-id="${note.id}">Edit</button>
          <button class="delete-btn" data-id="${note.id}">Delete</button>
        </div>
      </article>
    `,
    )
    .join("");
}

// Event delegation for Read, Edit, Delete
document.addEventListener("click", async (e) => {
  // READ MORE
  if (e.target.classList.contains("read-more-btn")) {
    const card = e.target.closest(".note-card");
    const expanded = card.classList.toggle("expanded");
    e.target.setAttribute("aria-expanded", expanded);
    e.target.textContent = expanded ? "Show less" : "Read in full";
    return;
  }

  // EDIT → redirect to upload.html with query param
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;
    window.location.href = `/upload.html?id=${id}`;
    return;
  }

  // DELETE
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    try {
      const res = await fetch(`/api/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadNotes();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }
});

loadNotes();
