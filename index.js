import {
  getLatestChromeVersion,
  getCurrentChromeVersion,
  diffChromeVersions,
  updateChromeVersion,
} from "./chrome.js";

import {
  getLatestEdgeVersion,
  getCurrentEdgeVersion,
  diffEdgeVersions,
  updateEdgeVersion,
} from "./edge.js";

async function runCheck(
  getLatestVersion,
  getCurrentVersion,
  diffVersions,
  updateVersion,
) {
  try {
    const latestVersion = await getLatestVersion();
    const currentVersion = await getCurrentVersion();
    if (diffVersions(latestVersion, currentVersion) > 0) {
      await updateVersion(latestVersion);
      return { ok: true, statusCode: 0, shouldPush: true };
    }
    return { ok: true, statusCode: 0, shouldPush: false };
  } catch (e) {
    console.error(e);
    return { ok: false, statusCode: 1, shouldPush: false };
  }
}

const chromeResult = await runCheck(
  getLatestChromeVersion,
  getCurrentChromeVersion,
  diffChromeVersions,
  updateChromeVersion,
);

const edgeResult = await runCheck(
  getLatestEdgeVersion,
  getCurrentEdgeVersion,
  diffEdgeVersions,
  updateEdgeVersion,
);

console.log("build script done");

// TBD how do we want to handle failures? It might make sense to ignore them, but then we don't know when stuff breaks.
if (chromeResult.statusCode !== 0) {
  console.error("chrome update failed");
  process.exit(chromeResult.statusCode);
}

if (edgeResult.statusCode !== 0) {
  console.error("edge update failed");
  process.exit(edgeResult.statusCode);
}

if (chromeResult.shouldCommit || edgeResult.shouldCommit) {
  console.log("committing updates");
  execSync("git add chrome_version.json");
  execSync("git commit -m 'update chrome version'");
}

process.exit(0);
