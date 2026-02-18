import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "logbook";
const collectionName = process.env.COLLECTION_NAME || "notes";

// MongoDB connection options
const options = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please define MONGODB_URI environment variable");
}

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the connection is preserved
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (Vercel), it's fine to create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a function to get the collection
export async function getCollection() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    return db.collection(collectionName);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw new Error("Failed to connect to database");
  }
}

// Optional: Export a function to close connection (useful for testing)
export async function closeConnection() {
  if (client) {
    await client.close();
  }
}
