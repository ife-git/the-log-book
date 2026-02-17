import http from "node:http";
import { serveStatic } from "./utils/serveStatic.js";
import {
  handleGet,
  handlePost,
  handleDelete,
  handlePut,
  handleMotivation,
} from "./handlers/routeHandlers.js";

const PORT = 8000;
const __dirname = import.meta.dirname;

const server = http.createServer(async (req, res) => {
  // DELETE (most specific first)
  if (req.method === "DELETE" && req.url.startsWith("/api/")) {
    return await handleDelete(req, res, __dirname);
  }

  // POST
  if (req.method === "POST" && req.url === "/api") {
    return await handlePost(req, res, __dirname);
  }

  // GET exact /api
  if (req.method === "GET" && req.url === "/api") {
    return await handleGet(req, res, __dirname);
  }

  // PUT /api/:id
  if (req.method === "PUT" && req.url.startsWith("/api")) {
    return await handlePut(req, res, __dirname);
  }
  if (req.url === "/api/motivation") {
    return await handleMotivation(req, res, __dirname);
  }

  // Static files
  return await serveStatic(req, res, __dirname);
});

server.listen(PORT, () => {
  console.log(`Connected on port: ${PORT}`);
});
