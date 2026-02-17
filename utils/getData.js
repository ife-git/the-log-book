import path from "node:path";
import fs from "node:fs/promises";

export async function getData(baseDir) {
  try {
    const dataFilePath = path.join(baseDir, "data", "data.json");
    const jsonString = await fs.readFile(dataFilePath, "utf8");
    const parsedData = JSON.parse(jsonString);
    return parsedData;
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}
