import { ObjectId } from "mongodb";
import { getCollection } from "./mongoDB.js";

export async function deleteNote(id, baseDir) {
  try {
    const collection = await getCollection();

    // Convert string id to MongoDB ObjectId
    const objectId = new ObjectId(id);

    // Delete the note with matching _id
    const result = await collection.deleteOne({ _id: objectId });

    // Check if a note was actually deleted
    if (result.deletedCount === 0) {
      throw new Error("Note not found");
    }

    return true; // Success
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === "BSONError" || err.message.includes("ObjectId")) {
      throw new Error("Invalid note ID format");
    }
    throw new Error(`Delete failed: ${err.message}`);
  }
}
