import { getData } from "../utils/getData.js";
import { deleteNote } from "../utils/deleteNote.js";
import { sendResponse } from "../utils/sendResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { addNewNotes } from "../utils/addNewNotes.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";
import { uploadEvents } from "../events/uploadEvents.js";
import { motivationalMessages } from "../data/motivationalMessages.js";
import fs from "node:fs/promises";
import path from "node:path";

export async function handleGet(req, res, baseDir) {
  const data = await getData(baseDir);
  const content = JSON.stringify(data);

  sendResponse(res, 200, "application/json", content);
}

export async function handlePost(req, res, baseDir) {
  try {
    const parsedBody = await parseJSONBody(req);
    const sanitizedBody = sanitizeInput(parsedBody);
    //await addNewNotes(sanitizedBody, baseDir);
    const newNote = await addNewNotes(sanitizedBody, baseDir);

    uploadEvents.emit("notes-added", sanitizedBody);

    sendResponse(res, 201, "application/json", JSON.stringify(newNote));

    //  sendResponse(res, 201, "application/json", JSON.stringify(sanitizedBody));
  } catch (err) {
    sendResponse(res, 400, "text/plain", err.message);
  }
}

export async function handleDelete(req, res, baseDir) {
  try {
    const id = req.url.split("/")[2];

    if (!id) {
      return sendResponse(res, 400, "text/plain", "Missing ID");
    }

    await deleteNote(id, baseDir);

    return sendResponse(res, 204, "text/plain", "");
  } catch (err) {
    if (err.message === "Note not found") {
      return sendResponse(res, 404, "text/plain", "Note not found");
    }

    return sendResponse(res, 500, "text/plain", "Delete failed");
  }
}

export async function handlePut(req, res, baseDir) {
  try {
    const id = req.url.split("/")[2]; // extract ID from /api/:id
    if (!id) {
      return sendResponse(res, 400, "text/plain", "Missing ID");
    }

    const parsedBody = await parseJSONBody(req);
    const sanitizedBody = sanitizeInput(parsedBody);

    // Read existing notes
    const notes = await getData(baseDir);

    const noteIndex = notes.findIndex((n) => n.id === id);
    if (noteIndex === -1) {
      return sendResponse(res, 404, "text/plain", "Note not found");
    }

    // Update note
    notes[noteIndex] = {
      ...notes[noteIndex],
      ...sanitizedBody,
      updatedAt: new Date().toISOString(), // optional
    };

    // Save updated notes
    await fs.writeFile(
      path.join(baseDir, "db.json"), // assuming db.json stores notes
      JSON.stringify(notes, null, 2),
    );

    sendResponse(
      res,
      200,
      "application/json",
      JSON.stringify(notes[noteIndex]),
    );
  } catch (err) {
    console.error("PUT error:", err);
    sendResponse(res, 500, "text/plain", "Update failed");
  }
}

export async function handleMotivation(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let i = 0; // start index

  const interval = setInterval(() => {
    // send the current message
    res.write(
      `data: ${JSON.stringify({
        motif: motivationalMessages[i],
      })}\n\n`,
    );

    // move to next message, loop back if at end
    i = (i + 1) % motivationalMessages.length;
  }, 3000); // every 3 seconds

  req.on("close", () => {
    clearInterval(interval);
  });
}
