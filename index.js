import {
  getLatestChromeVersion,
  getCurrentChromeVersion,
  diffChromeVersions,
  updateChromeVersionFile,
} from "./chrome.js";
import {
  getLatestEdgeVersion,
  getCurrentEdgeVersion,
  diffEdgeVersions,
  updateEdgeVersionFile,
} from "./edge.js";
import { runCheck } from "./main.js";
import { addCommitPush } from "./git.js";

const chromeResult = await runCheck(
  getLatestChromeVersion,
  getCurrentChromeVersion,
  diffChromeVersions,
  updateChromeVersionFile,
);

const edgeResult = await runCheck(
  getLatestEdgeVersion,
  getCurrentEdgeVersion,
  diffEdgeVersions,
  updateEdgeVersionFile,
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

if (chromeResult.shouldPush || edgeResult.shouldPush) {
  addCommitPush(chromeResult.shouldPush, edgeResult.shouldPush);
}

process.exit(0);
