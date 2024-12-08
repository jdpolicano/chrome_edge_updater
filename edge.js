// https://edgeupdates.microsoft.com/api/products
import got from "got";
import { compareVersions } from "compare-versions";
import { getLogger } from "./log.js";
import { getJsonEndpoint, getJsonFile, commitNewVersion } from "./common.js";
/**
@typedef {Object} EdgeVersionRelease
@property {string} Platform
@property {string} Architecture
@property {string} ProductVersion
*/

/**
@typedef {Object} EdgeProduct
@property {string} Product
@property {EdgeVersionRelease[]} Releases
*/

/**
@typedef {EdgeProduct[]} EdgeVersionResponse
*/

const log = getLogger("msedge");

/**
 * @returns {Promise<EdgeVersionResponse>}
 */
export const getLatestEdgeVersion = () => {
  return getJsonEndpoint("https://edgeupdates.microsoft.com/api/products", log);
};

/**
 * @returns {Promise<EdgeVersionResponse>}
 */
export const getCurrentEdgeVersion = () => {
  return getJsonFile("./edge_version.json", log);
};

/**
@param {EdgeVersionResponse} latestVersion
@param {EdgeVersionResponse} currentVersion
@returns {number}
*/
export const diffEdgeVersions = (latestVersion, currentVersion) => {
  const diff = diffEdgeProduct(
    latestVersion.find((p) => p.Product === "Stable"),
    currentVersion.find((p) => p.Product === "Stable"),
  );
  return diff;
};

/**
 * @param {EdgeProduct} latest
 * @param {EdgeProduct} current
 * @returns {number} - the diff if any
 */
const diffEdgeProduct = (latest, current) => {
  if (latest?.Product !== current?.Product) {
    return 0;
  }

  for (const latestRelease of latest.Releases.filter(isInterestingRelease)) {
    // find the corresponding release in the current version based on platform and architecture
    const currentRelease = current.Releases.find(
      (r) =>
        r.Platform === latestRelease.Platform &&
        r.Architecture === latestRelease.Architecture,
    );

    // if for some reason we don't have a current release, skip it
    if (!currentRelease) {
      continue;
    }

    // compare the versions
    log("diffing release", latestRelease.Platform, latestRelease.Architecture);
    const diff = diffEdgeRelease(latestRelease, currentRelease);

    // if the latest version is newer, return the diff and short circuit
    if (diff > 0) {
      log(
        `found newer version ${latestRelease.ProductVersion} for ${latestRelease.Platform} ${latestRelease.Architecture}`,
      );
      commitNewVersion(
        "edge",
        "./edge_version.json",
        latestRelease.ProductVersion,
      );
      return diff;
    }
  }

  // fail safe, if we didn't find any newer versions, return 0
  log("no newer versions found");
  return 0;
};

/**
 * @param {EdgeVersionRelease} latest
 * @param {EdgeVersionRelease} current
 * @returns {number} - the diff if any
 */
const diffEdgeRelease = (latest, current) => {
  return compareVersions(latest.ProductVersion, current.ProductVersion);
};

/**
 * Filters out any platforms that are not Windows, MacOS, or Linux because we don't care about those
 * @param {EdgeVersionRelease} release
 * @returns {boolean}
 */
const isInterestingRelease = (release) => {
  return (
    release.Platform === "Windows" ||
    release.Platform === "MacOS" ||
    release.Platform === "Linux"
  );
};

/**
@param {EdgeVersionResponse} latestVersion
@returns {Promise<void>}
*/
export const updateEdgeVersion = async (latestVersion) => {
  log("updating edge version");
  await fs.writeFile(
    "./edge_version.json",
    JSON.stringify(latestVersion, null, 2),
  );
  log("edge version file updated");
};
