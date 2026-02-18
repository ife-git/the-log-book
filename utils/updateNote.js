import { ObjectId } from "mongodb";
import { getCollection } from "./mongoDB.js";

export async function updateNote(id, updates, baseDir) {
  try {
    const collection = await getCollection();

    // Convert string id to MongoDB ObjectId
    const objectId = new ObjectId(id);

    // Add updated timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update the note
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData },
    );

    // Check if note was found
    if (result.matchedCount === 0) {
      throw new Error("Note not found");
    }

    // Fetch and return the updated note
    const updatedNote = await collection.findOne({ _id: objectId });

    // Format for frontend (convert _id to id)
    return {
      id: updatedNote._id.toString(),
      title: updatedNote.title,
      content: updatedNote.content,
      category: updatedNote.category,
      timestamp: updatedNote.timestamp,
      updatedAt: updatedNote.updatedAt,
    };
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === "BSONError" || err.message.includes("ObjectId")) {
      throw new Error("Invalid note ID format");
    }
    throw new Error(`Update failed: ${err.message}`);
  }
}
