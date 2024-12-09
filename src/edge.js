// https://edgeupdates.microsoft.com/api/products
import fs from "node:fs/promises";
import { compareVersions } from "compare-versions";
import { getLogger } from "./log.js";
import { getJsonEndpoint, getJsonFile } from "./common.js";
import { validateSchema, edgeResponseSchema } from "./schemas.js";

const log = getLogger("msedge");

export const getLatestEdgeVersion = async () => {
  const response = await getJsonEndpoint(
    "https://edgeupdates.microsoft.com/api/products",
    log,
  );

  const validated = validateSchema(edgeResponseSchema, response, log);

  if (!validated) {
    throw new Error("schema validation failed");
  }

  return validated;
};

export const getCurrentEdgeVersion = () => {
  return getJsonFile("./edge_version.json", log);
};

export const diffEdgeVersions = (latestVersion, currentVersion) => {
  const latest = latestVersion.find((p) => p.Product === "Stable");
  const current = currentVersion.find((p) => p.Product === "Stable");

  if (!latest || !current) {
    log(
      'one of the latest or current versions is missing a "Stable" product type',
    );
    return 0;
  }

  return diffEdgeProduct(latest, current);
};

export const diffEdgeProduct = (latestProduct, currentProduct) => {
  const latestReleases = latestProduct.Releases.filter(isInterestingRelease);
  const currentReleases = currentProduct.Releases.filter(isInterestingRelease);

  for (const latestRelease of latestReleases) {
    // find the corresponding release in the current version based on platform and architecture
    const currentRelease = currentReleases.find(
      (r) =>
        r.Platform === latestRelease.Platform &&
        r.Architecture === latestRelease.Architecture,
    );
    // if for some reason we don't have a current release, skip it
    if (!currentRelease) {
      continue;
    }
    // compare the versions
    const diff = diffEdgeRelease(latestRelease, currentRelease);
    // if the latest version is newer, return the diff and short circuit
    if (diff > 0) {
      log(
        `found newer version ${latestRelease.ProductVersion} for ${latestRelease.Platform} ${latestRelease.Architecture}`,
      );
      return diff;
    }
  }

  // fail safe, if we didn't find any newer versions, return 0
  log("no newer versions found");
  return 0;
};

export const diffEdgeRelease = (latest, current) => {
  log("diffing release", latest.Platform, latest.Architecture);
  return compareVersions(latest.ProductVersion, current.ProductVersion);
};

export const isInterestingRelease = (release) => {
  return (
    release.Platform === "Windows" ||
    release.Platform === "MacOS" ||
    release.Platform === "Linux"
  );
};

export const updateEdgeVersionFile = async (latestVersion, dryRun = false) => {
  if (dryRun) {
    log("dryRun flag present, skipping file update");
    return;
  }

  log("updating edge version");

  await fs.writeFile(
    "./edge_version.json",
    JSON.stringify(latestVersion, null, 2),
  );

  log("edge version file updated");
};
