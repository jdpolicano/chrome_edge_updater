import got from "got";
import fs from "node:fs/promises";

export const getJsonEndpoint = async (endpoint, log) => {
  log("trying enpoint:", endpoint);
  const response = await got(endpoint);
  log("response success, code:", response.statusCode);
  return JSON.parse(response.body);
};

export const getJsonFile = async (path, log) => {
  log("reading file:", path);
  return JSON.parse(await fs.readFile(path, "utf8"));
};
