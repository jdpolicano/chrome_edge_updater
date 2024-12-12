// https://edgeupdates.microsoft.com/api/products
import fs from "node:fs/promises";
import { compareVersions } from "compare-versions";
import { getLogger } from "./log.js";
import {
  getJsonEndpointWithValidation,
  getJsonFileWithValidation,
} from "./common.js";
import { validateSchema, edgeResponseSchema } from "./schemas.js";

const log = getLogger("msedge");

export const getLatestEdgeVersion = async () =>
  getJsonEndpointWithValidation(
    "https://edgeupdates.microsoft.com/api/products",
    edgeResponseSchema,
    log,
  );

export const getCurrentEdgeVersion = () =>
  getJsonFileWithValidation("./edge_version.json", edgeResponseSchema, log);

export const diffEdgeVersions = (latestVersion, currentVersion) => {
  const isStableProduct = (product) => product.Product === "Stable";
  const latest = latestVersion.find(isStableProduct);
  const current = currentVersion.find(isStableProduct);

  if (!latest || !current) {
    log(
      'one of the latest or current versions is missing a "Stable" product type',
    );
    return 0;
  }

  return diffEdgeProduct(latest, current);
};

export const diffEdgeProduct = (latestProduct, currentProduct) => {
  const isLinux = (release) =>
    release.Platform === "Linux" && release.Architecture === "x64";

  const latestRelease = latestProduct.Releases.find(isLinux);
  const currentRelease = currentProduct.Releases.find(isLinux);

  if (!latestRelease || !currentRelease) {
    log("one of the latest or current versions is missing a Linux x64 release");
    return 0;
  }
  // compare the versions
  const diff = diffEdgeRelease(latestRelease, currentRelease);

  const msg =
    diff > 0
      ? `found newer version ${latestRelease.ProductVersion} for ${latestRelease.Platform} ${latestRelease.Architecture}`
      : "current version is up to date";
  // if the latest version is newer, return the diff and short circuit
  log(msg);

  return diff;
};

export const diffEdgeRelease = (latest, current) => {
  log("diffing release", latest.Platform, latest.Architecture);
  return compareVersions(latest.ProductVersion, current.ProductVersion);
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
