console.log("🔥🔥🔥 SERVER.JS IS EXECUTING 🔥🔥🔥");
console.log("Current directory:", process.cwd());
console.log("Node version:", process.version);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

import http from "node:http";
import { serveStatic } from "./utils/serveStatic.js";
import {
  handleGet,
  handlePost,
  handleDelete,
  handlePut,
  handleMotivation,
  handleDebug,
  handleTestDB,
} from "./handlers/routeHandlers.js";

const PORT = 8000;
const __dirname = import.meta.dirname;

console.log("📦 Imports loaded successfully");

// Export for Vercel
export async function handleRequest(req, res, baseDir) {
  console.log(`📨 Request: ${req.method} ${req.url}`);

  // Simple test route
  if (req.url === "/test") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Server is working!");
  }

  // API Routes
  if (req.method === "DELETE" && req.url.startsWith("/api/")) {
    return await handleDelete(req, res, baseDir);
  }
  if (req.method === "POST" && req.url === "/api") {
    return await handlePost(req, res, baseDir);
  }
  if (req.method === "GET" && req.url === "/api") {
    return await handleGet(req, res, baseDir);
  }
  if (req.method === "PUT" && req.url.startsWith("/api")) {
    return await handlePut(req, res, baseDir);
  }
  if (req.method === "GET" && req.url === "/api/debug") {
    return await handleDebug(req, res, baseDir);
  }
  if (req.method === "GET" && req.url === "/api/test-db") {
    return await handleTestDB(req, res, baseDir);
  }
  if (req.url === "/api/motivation") {
    return await handleMotivation(req, res, baseDir);
  }

  // Static files
  console.log(`📁 Trying static file for: ${req.url}`);
  return await serveStatic(req, res, baseDir);
}

// Create server
const server = http.createServer((req, res) => {
  handleRequest(req, res, __dirname).catch((err) => {
    console.error("❌ Unhandled error in request:", err);
    res.writeHead(500);
    res.end("Internal Server Error");
  });
});

// Start server - SIMPLE AND DIRECT
server.listen(PORT, () => {
  console.log(`✅ Server successfully listening on http://localhost:${PORT}`);
  console.log(`✅ Test URL: http://localhost:${PORT}/test`);
  console.log(`✅ Notes URL: http://localhost:${PORT}/notes.html`);
});

// Handle errors
server.on("error", (err) => {
  console.error("❌ Server error:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err);
});
