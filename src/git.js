import { execSync } from "node:child_process";
import { getLogger } from "./log.js";

const log = getLogger("git");

export function getCommitMessage(chromeChanged, edgeChanged) {
  if (chromeChanged && edgeChanged) {
    return "[skip-ci] chore: update chrome and edge versions";
  }

  if (chromeChanged) {
    return "[skip-ci] chore: update chrome version";
  }

  if (edgeChanged) {
    return "[skip-ci] chore: update edge version";
  }

  return "";
}

export function addCommitPush(chromeChanged, edgeChanged, dryRun = false) {
  const commitMsg = getCommitMessage(chromeChanged, edgeChanged);
  if (!dryRun) {
    try {
      execSync(`git add .`);
      execSync(`git commit -m '${commitMsg}'`);
      execSync(`git push`);
    } catch {
      log("failed to commit and push");
    }
  } else {
    printGitPlan(commitMsg);
  }
}

function printGitPlan(commitMsg) {
  log("dryRun flag present, would run the following commands:");
  log("- git add .");
  log(`- git commit -m '${commitMsg}'`);
  log("- git push");
}
