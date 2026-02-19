// Import your server's request handler
import { handleRequest } from "../server.js";

export default async function handler(req, res) {
  // Get the base directory (project root)
  const baseDir = process.cwd();

  // Add CORS headers if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Create a simpler request object that matches what your handlers expect
  const simpleReq = {
    method: req.method,
    url: req.url,
    on: (event, callback) => {
      if (event === "data") {
        // Handle body data if needed
        if (req.body) {
          callback(req.body);
        }
      }
      if (event === "end") {
        callback();
      }
    },
  };

  // Add body if it exists
  if (req.body) {
    simpleReq.body = req.body;
  }

  // Call your existing request handler
  await handleRequest(simpleReq, res, baseDir);
}
