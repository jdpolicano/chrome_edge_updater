export async function runCheck(
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
      return { statusCode: 0, shouldPush: true };
    }
    return { statusCode: 0, shouldPush: false };
  } catch (e) {
    console.error(e);
    return { statusCode: 1, shouldPush: false };
  }
}
