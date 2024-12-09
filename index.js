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
import { runCheck } from "./runCheck.js";
import { addCommitPush } from "./git.js";

// logs are cleaner if we don't parallelize these updates.
const chromeResult = await runCheck(
  getLatestChromeVersion,
  getCurrentChromeVersion,
  diffChromeVersions,
  updateChromeVersionFile,
  Boolean(process.env.DRY_RUN),
);

const edgeResult = await runCheck(
  getLatestEdgeVersion,
  getCurrentEdgeVersion,
  diffEdgeVersions,
  updateEdgeVersionFile,
  Boolean(process.env.DRY_RUN),
);

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
  addCommitPush(
    chromeResult.shouldPush,
    edgeResult.shouldPush,
    Boolean(process.env.DRY_RUN),
  );
}

process.exit(0);
