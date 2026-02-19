export async function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    // Handle different request types (Node.js native vs Vercel)
    if (typeof req.on === "function") {
      // Native Node.js request (stream)
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error(`Invalid JSON format: ${err.message}`));
        }
      });

      req.on("error", (err) => {
        reject(new Error(`Request error: ${err.message}`));
      });
    }
    // Handle Vercel/API route request (body might already be parsed)
    else if (req.body) {
      try {
        // If body is already a string, parse it; if it's an object, use it directly
        const parsedBody =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        resolve(parsedBody);
      } catch (err) {
        reject(new Error(`Invalid JSON format: ${err.message}`));
      }
    } else {
      reject(new Error("No request body found"));
    }
  });
}
