import path from "node:path";
import fs from "node:fs/promises";
import { getData } from "./getData.js";

export async function deleteNote(id, baseDir) {
  const dataFilePath = path.join(baseDir, "data", "data.json");

  const notes = await getData(baseDir);

  const filteredNotes = notes.filter((note) => note.id !== id);

  // Optional: Check if note existed
  if (filteredNotes.length === notes.length) {
    throw new Error("Note not found");
  }

  await fs.writeFile(
    dataFilePath,
    JSON.stringify(filteredNotes, null, 2),
    "utf8",
  );
}
