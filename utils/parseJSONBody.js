export async function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    // Case 1: Body is already a string (from our unifiedReq)
    if (typeof req.body === "string") {
      try {
        resolve(JSON.parse(req.body));
        return;
      } catch (err) {
        reject(new Error(`Invalid JSON format: ${err.message}`));
        return;
      }
    }

    // Case 2: Body is already parsed (unlikely, but handle it)
    if (typeof req.body === "object" && req.body !== null) {
      resolve(req.body);
      return;
    }

    // Case 3: Traditional stream (Node.js native)
    let body = "";

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
  });
}
