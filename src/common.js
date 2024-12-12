import got from "got";
import fs from "node:fs/promises";
import { validateSchema } from "./schemas.js";

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

export const getJsonEndpointWithValidation = async (endpoint, schema, log) => {
  const response = await getJsonEndpoint(endpoint, log);
  const validated = validateSchema(schema, response, log);
  if (validated === undefined) {
    throw new Error(`schema validation failed for endpoint ${endpoint}`);
  }
  return validated;
};

export const getJsonFileWithValidation = async (path, schema, log) => {
  const response = await getJsonFile(path, log);
  const validated = validateSchema(schema, response, log);
  if (!validated === undefined) {
    throw new Error(`schema validation failed for file at ${path}`);
  }
  return validated;
};
