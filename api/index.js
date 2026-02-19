import { handleRequest } from "../server.js";

export default async function handler(req, res) {
  const baseDir = process.cwd();

  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Create a unified request object that works with your handlers
  const unifiedReq = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    // Add a custom body property that will work with parseJSONBody
    body: null,
    // Add event methods for backward compatibility
    on: (event, callback) => {
      if (event === "data" && req.body) {
        // If body is already a string, send it
        if (typeof req.body === "string") {
          callback(req.body);
        }
        // If body is an object, stringify it
        else if (typeof req.body === "object") {
          callback(JSON.stringify(req.body));
        }
      }
      if (event === "end") {
        callback();
      }
    },
  };

  // Store the raw body for later use
  if (req.body) {
    if (typeof req.body === "string") {
      unifiedReq.body = req.body;
    } else {
      unifiedReq.body = JSON.stringify(req.body);
    }
  }

  await handleRequest(unifiedReq, res, baseDir);
}
