const { printTable, getInstalledApps } = require("./templates");
const { welcomeMessage } = require("./welcome");

module.exports = async () => {
  await welcomeMessage("Showing process status...");

  const installedApps = await getInstalledApps();

  printTable(installedApps);
};
