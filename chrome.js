import got from "got";
import fs from "node:fs/promises";
import { compareVersions } from "compare-versions";
import { getLogger } from "./log.js";
import { getJsonEndpoint, getJsonFile, commitNewVersion } from "./common.js";
/**
@typedef {Object} ChromeVersionResponse
@property {Object} channels
@property {Object} channels.Stable
@property {string} channels.Stable.version
*/

const log = getLogger("chrome");

/**
 * @returns {Promise<ChromeVersionResponse>}
 */
export const getLatestChromeVersion = async (a) => {
  return getJsonEndpoint(
    "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json",
    log,
  );
};

/**
 * @returns {Promise<ChromeVersionResponse>}
 */
export const getCurrentChromeVersion = async () => {
  return getJsonFile("./chrome_version.json", log);
};

/**
@param {ChromeVersionResponse} latestVersion
@param {ChromeVersionResponse} currentVersion
@returns {number}
*/
export const diffChromeVersions = (latestVersion, currentVersion) => {
  log("current version:", currentVersion.channels.Stable.version);
  log("latest version:", latestVersion.channels.Stable.version);
  const diff = compareVersions(
    latestVersion.channels.Stable.version,
    currentVersion.channels.Stable.version,
  );
  const msg =
    diff > 0 ? "a newer version available" : "current version is up to date";

  if (diff > 0) {
    log("committing new version");
    commitNewVersion(
      "chrome",
      "./chrome_version.json",
      latestVersion.channels.Stable.version,
    );
  }

  log(msg);
  return diff;
};

/**
@param {ChromeVersionResponse} latestVersion
@returns {Promise<void>}
*/
export const updateChromeVersion = async (latestVersion) => {
  log("updating chrome version");
  await fs.writeFile(
    "./chrome_version.json",
    JSON.stringify(latestVersion, null, 2),
  );
  log("chrome version file updated");
};
