import path from "node:path";
import fs from "node:fs/promises";
import { sendResponse } from "./sendResponse.js";
import { getContentType } from "./getContentType.js";

export async function serveStatic(req, res, baseDir) {
  console.log(`📁 serveStatic called for: ${req.url}`);
  console.log(`📁 baseDir: ${baseDir}`);

  const publicDir = path.join(baseDir, "public");
  console.log(`📁 publicDir: ${publicDir}`);

  const requestedPath = req.url.split("?")[0];
  console.log(`📁 requestedPath: ${requestedPath}`);

  const safePath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, "");
  console.log(`📁 safePath: ${safePath}`);

  const finalPath =
    safePath === "/" || safePath === "\\" || safePath === ""
      ? "index.html"
      : safePath;
  console.log(`📁 finalPath: ${finalPath}`);

  const filePath = path.join(publicDir, finalPath);
  console.log(`📁 Attempting to serve: ${filePath}`);

  // Check if file exists
  try {
    await fs.access(filePath);
    console.log(`📁 File exists: ${filePath}`);
  } catch (e) {
    console.log(`📁 File does NOT exist: ${filePath}`);
  }

  const ext = path.extname(filePath);
  const contentType = getContentType(ext);

  try {
    const stat = await fs.stat(filePath);
    console.log(
      `📁 File stats: size=${stat.size}, isDirectory=${stat.isDirectory()}`,
    );

    if (stat.isDirectory()) {
      throw new Error("Directory access denied");
    }

    const content = await fs.readFile(filePath);
    console.log(`📁 Successfully read file: ${filePath}`);
    sendResponse(res, 200, contentType, content);
  } catch (err) {
    console.error(`📁 Error serving file:`, err);
    if (err.code === "ENOENT") {
      const errorFilePath = path.join(publicDir, "404.html");
      console.log(`📁 Trying to serve 404 page: ${errorFilePath}`);
      try {
        const errorContent = await fs.readFile(errorFilePath);
        sendResponse(res, 404, "text/html", errorContent);
      } catch (e) {
        console.log(`📁 404.html also not found, sending simple 404`);
        sendResponse(res, 404, "text/html", "<h1>404 Not Found</h1>");
      }
    } else {
      sendResponse(
        res,
        500,
        "text/html",
        `<html><h1>Server Error: ${err.code}</h1></html>`,
      );
    }
  }
}
