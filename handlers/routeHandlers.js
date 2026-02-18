import { getData } from "../utils/getData.js";
import { deleteNote } from "../utils/deleteNote.js";
import { sendResponse } from "../utils/sendResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { addNewNotes } from "../utils/addNewNotes.js";
import { updateNote } from "../utils/updateNote.js"; // NEW import
import { sanitizeInput } from "../utils/sanitizeInput.js";
import { uploadEvents } from "../events/uploadEvents.js";
import { motivationalMessages } from "../data/motivationalMessages.js";
// REMOVED: fs and path imports - no longer needed

export async function handleGet(req, res, baseDir) {
  try {
    const data = await getData(baseDir);
    console.log("Data length:", data.length); // Check Vercel logs
    // console.log("baseDir:", baseDir); // Optional: remove if not needed
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

    const newNote = await addNewNotes(sanitizedBody, baseDir);

    uploadEvents.emit("notes-added", sanitizedBody);

    sendResponse(res, 201, "application/json", JSON.stringify(newNote));
  } catch (err) {
    sendResponse(
      res,
      400,
      "application/json",
      JSON.stringify({ error: err.message }),
    );
  }
}

export async function handleDelete(req, res, baseDir) {
  try {
    const id = req.url.split("/")[2];

    if (!id) {
      return sendResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: "Missing ID" }),
      );
    }

    await deleteNote(id, baseDir);

    return sendResponse(res, 204, "application/json", "");
  } catch (err) {
    if (err.message === "Note not found") {
      return sendResponse(
        res,
        404,
        "application/json",
        JSON.stringify({ error: "Note not found" }),
      );
    }
    if (err.message.includes("Invalid note ID format")) {
      return sendResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: "Invalid ID format" }),
      );
    }
    return sendResponse(
      res,
      500,
      "application/json",
      JSON.stringify({ error: err.message }),
    );
  }
}

export async function handlePut(req, res, baseDir) {
  try {
    const id = req.url.split("/")[2]; // extract ID from /api/:id
    if (!id) {
      return sendResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: "Missing ID" }),
      );
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

    // Use the new updateNote utility instead of file operations
    const updatedNote = await updateNote(id, sanitizedBody, baseDir);

    sendResponse(res, 200, "application/json", JSON.stringify(updatedNote));
  } catch (err) {
    console.error("PUT error:", err);

    if (err.message === "Note not found") {
      return sendResponse(
        res,
        404,
        "application/json",
        JSON.stringify({ error: "Note not found" }),
      );
    }
    if (err.message.includes("Invalid note ID format")) {
      return sendResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: "Invalid ID format" }),
      );
    }

    sendResponse(
      res,
      500,
      "application/json",
      JSON.stringify({ error: err.message }),
    );
  }
}

export async function handleMotivation(req, res) {
  // Change from SSE to simple REST endpoint
  try {
    // Get a random message
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    const message = motivationalMessages[randomIndex];

    // Return as JSON
    sendResponse(
      res,
      200,
      "application/json",
      JSON.stringify({ motif: message }),
    );
  } catch (err) {
    console.error("Motivation error:", err);
    sendResponse(
      res,
      500,
      "application/json",
      JSON.stringify({ error: "Failed to get motivation message" }),
    );
  }
}
