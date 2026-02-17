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
  try {
    const data = await getData(baseDir);
    console.log("Data length:", data.length); // Check Vercel logs
    console.log("baseDir:", baseDir); // See where it's looking
    sendResponse(res, 200, "application/json", JSON.stringify(data));
  } catch (err) {
    console.error("GET error:", err);
    sendResponse(
      res,
      500,
      "application/json",
      JSON.stringify({ error: err.message }),
    );
  }
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

    // Validate required fields
    const requiredFields = ["title", "content", "category", "timestamp"];
    const missingFields = requiredFields.filter(
      (field) => !sanitizedBody[field],
    );

    if (missingFields.length > 0) {
      return sendResponse(
        res,
        400,
        "application/json",
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        }),
      );
    }

    // Read existing notes
    const notes = await getData(baseDir);

    const noteIndex = notes.findIndex((n) => n.id === id);
    if (noteIndex === -1) {
      return sendResponse(res, 404, "text/plain", "Note not found");
    }

    // Preserve the original timestamp format? Or update consistently?
    // I'd recommend storing dates consistently in ISO format and formatting on display
    // But to maintain compatibility, let's keep the original timestamp format
    const updatedNote = {
      ...notes[noteIndex],
      ...sanitizedBody,
      updatedAt: new Date().toISOString(), // Track when it was updated
    };

    // Update note
    notes[noteIndex] = updatedNote;

    // Save updated notes to the CORRECT location (data/data.json)
    await fs.writeFile(
      path.join(baseDir, "data", "data.json"), // ✅ Fixed: now writes to data/data.json
      JSON.stringify(notes, null, 2),
      "utf8",
    );

    sendResponse(res, 200, "application/json", JSON.stringify(updatedNote));
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
