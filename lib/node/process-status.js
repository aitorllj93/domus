const { printTable, getInstalledApps } = require("./templates");
const { welcomeMessage } = require("./welcome");

module.exports = async (apps) => {
  try {
    // await welcomeMessage("Showing process status...", 0);
    const appNames = apps?.toLowerCase()?.split(",");

    const installedApps = await getInstalledApps();

    const appsToPrint = appNames
      ? installedApps.filter(
          (t) =>
            appNames.includes(t.attributes.name?.toLowerCase()) ||
            appNames.includes(
              t.attributes["x-domus"]?.title?.en_us?.toLowerCase()
            )
        )
      : installedApps;

    printTable(appsToPrint);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
