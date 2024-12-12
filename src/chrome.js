import fs from "node:fs/promises";
import { compareVersions } from "compare-versions";
import { getLogger } from "./log.js";
import {
  getJsonEndpointWithValidation,
  getJsonFileWithValidation,
} from "./common.js";
import { chromeResponseSchema } from "./schemas.js";

const log = getLogger("chrome");

export const getLatestChromeVersion = async () =>
  getJsonEndpointWithValidation(
    "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json",
    chromeResponseSchema,
    log,
  );

export const getCurrentChromeVersion = async () =>
  getJsonFileWithValidation("./chrome_version.json", chromeResponseSchema, log);

export const diffChromeVersions = (latestVersion, currentVersion) => {
  log("current version:", currentVersion.channels.Stable.version);
  log("latest version:", latestVersion.channels.Stable.version);
  const diff = compareVersions(
    latestVersion.channels.Stable.version,
    currentVersion.channels.Stable.version,
  );
  const msg =
    diff > 0 ? "a newer version is available" : "current version is up to date";
  log(msg);
  return diff;
};

export const updateChromeVersionFile = async (
  latestVersion,
  dryRun = false,
) => {
  if (dryRun) {
    log("dryRun flag present, skipping file update");
    return;
  }

  log("updating chrome version");

  await fs.writeFile(
    "./chrome_version.json",
    JSON.stringify(latestVersion, null, 2),
  );

  log("chrome version file updated");
};
