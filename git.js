import { execSync } from "node:child_process";

export function getCommitMessage(chromeChanged, edgeChanged) {
  if (chromeChanged && edgeChanged) {
    return "chore: update chrome and edge versions";
  }

  if (chromeChanged) {
    return "chore: update chrome version";
  }

  if (edgeChanged) {
    return "chore: update edge version";
  }

  return "";
}

export function addCommitPush(chromeChanged, edgeChanged) {
  const commitMsg = getCommitMessage(chromeChanged, edgeChanged);
  execSync(`git add .`);
  execSync(`git commit -m '${commitMsg}'`);
  execSync(`git push`);
}
