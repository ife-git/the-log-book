import path from "node:path";
import fs from "node:fs/promises";
import { getData } from "./getData.js";
import crypto from "node:crypto";

export async function addNewNotes(newNotes, baseDir) {
  try {
    const notes = await getData(baseDir);

    const noteWithId = {
      id: crypto.randomUUID(),
      ...newNotes,
    };

    notes.push(noteWithId);

    const dataFilePath = path.join(baseDir, "data", "data.json");

    await fs.writeFile(dataFilePath, JSON.stringify(notes, null, 2), "utf8");

    return noteWithId;
  } catch (err) {
    throw new Error(err.message);
  }
}
