import got from "got";
import fs from "node:fs/promises";
import { execSync } from "node:child_process";

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

export const commitNewVersion = (browserName, filePath, newVersion) => {
  execSync(`git add ${filePath}`);
  execSync(
    `git commit -m 'ci: update ${browserName} version to v${newVersion}'`,
  );
};

export const pushChanges = () => {
  execSync("git push");
};
