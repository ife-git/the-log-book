import { getCollection } from "./mongoDB.js";

export async function getData(baseDir) {
  try {
    const collection = await getCollection();

    // Fetch all notes from MongoDB
    const notes = await collection.find({}).toArray();

    // Convert MongoDB _id to string id for frontend compatibility
    const formattedNotes = notes.map((note) => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      category: note.category,
      timestamp: note.timestamp,
      // Include updatedAt if it exists (for edited notes)
      ...(note.updatedAt && { updatedAt: note.updatedAt }),
    }));

    return formattedNotes;
  } catch (err) {
    console.error("MongoDB getData error:", err);
    return []; // Return empty array on error (same behavior as file version)
  }
}
