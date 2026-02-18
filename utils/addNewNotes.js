import { getCollection } from "./mongoDB.js";

export async function addNewNotes(newNotes, baseDir) {
  try {
    const collection = await getCollection();

    // MongoDB will generate its own _id, but we'll also keep your existing fields
    const noteToInsert = {
      ...newNotes,
      createdAt: new Date().toISOString(), // Track when it was created
    };

    // Insert into MongoDB
    const result = await collection.insertOne(noteToInsert);

    // Return in the same format as before (with id as string)
    const insertedNote = {
      id: result.insertedId.toString(),
      ...newNotes,
    };

    return insertedNote;
  } catch (err) {
    throw new Error(`Failed to add note: ${err.message}`);
  }
}
