import path from "node:path";
import fs from "node:fs/promises";
import { sendResponse } from "./sendResponse.js";
import { getContentType } from "./getContentType.js";

export async function serveStatic(req, res, baseDir) {
  const publicDir = path.join(baseDir, "public");

  const requestedPath = req.url.split("?")[0];

  const safePath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, "");

  const finalPath =
    safePath === "/" || safePath === "\\" || safePath === ""
      ? "index.html"
      : safePath;

  const filePath = path.join(publicDir, finalPath);

  console.log("Serving path:", filePath);

  const ext = path.extname(filePath);
  const contentType = getContentType(ext);

  try {
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      throw new Error("Directory access denied");
    }

    const content = await fs.readFile(filePath);
    sendResponse(res, 200, contentType, content);
  } catch (err) {
    if (err.code === "ENOENT") {
      const errorFilePath = path.join(publicDir, "404.html");
      const errorContent = await fs.readFile(errorFilePath);
      sendResponse(res, 404, "text/html", errorContent);
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
