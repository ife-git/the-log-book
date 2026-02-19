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

  // Collect body for Vercel
  let body = "";

  // Vercel provides the body as a string or buffer
  if (req.body) {
    // If body is already a string or buffer
    body = req.body;
  } else {
    // Otherwise, collect it from the stream
    for await (const chunk of req) {
      body += chunk;
    }
  }

  // Create a unified request object that works with your handlers
  const unifiedReq = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: body, // Store raw body
    // Add event methods for backward compatibility
    on: (event, callback) => {
      if (event === "data" && body) {
        callback(body);
      }
      if (event === "end") {
        callback();
      }
    },
  };

  await handleRequest(unifiedReq, res, baseDir);
}
