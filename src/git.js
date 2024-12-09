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
  const gitCommands = [`git add .`, `git commit -m '${commitMsg}'`, `git push`];
  if (!dryRun) {
    try {
      gitCommands.forEach((command) => execSync(command));
    } catch (e) {
      log("failed to commit and push");
    }
  } else {
    printGitPlan(gitCommands);
  }
}

export function printGitPlan(commands) {
  log("dryRun flag present, would run the following commands:");
  commands.forEach(c => log(`- ${c}`);
}
