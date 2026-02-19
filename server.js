console.log("🔥🔥🔥 SERVER.JS IS EXECUTING 🔥🔥🔥");
console.log("Current directory:", process.cwd());
console.log("Node version:", process.version);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("COLLECTION_NAME:", process.env.COLLECTION_NAME);

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

// ✅ EXPORT this function for Vercel
export async function handleRequest(req, res, baseDir) {
  // DELETE (most specific first)
  if (req.method === "DELETE" && req.url.startsWith("/api/")) {
    return await handleDelete(req, res, baseDir);
  }

  // POST
  if (req.method === "POST" && req.url === "/api") {
    return await handlePost(req, res, baseDir);
  }

  // GET exact /api
  if (req.method === "GET" && req.url === "/api") {
    return await handleGet(req, res, baseDir);
  }

  // PUT /api/:id
  if (req.method === "PUT" && req.url.startsWith("/api")) {
    return await handlePut(req, res, baseDir);
  }

  // DEBUG ROUTES
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
  return await serveStatic(req, res, baseDir);
}

// ✅ This runs ONLY when you run node server.js locally
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = http.createServer((req, res) =>
    handleRequest(req, res, __dirname),
  );
  server.listen(PORT, () => {
    console.log(`✅ Local server connected on port: ${PORT}`);
  });
}
