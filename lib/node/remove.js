const { Confirm, MultiSelect } = require("enquirer");
const { welcomeMessage } = require("./welcome");
const { stopTemplate, printTable, getInstalledApps } = require("./templates");

const templateName = (template) =>
  `${template.attributes["x-domus"]?.emoji} ${
    template.attributes["x-domus"]?.title?.en_us || template.attributes.name
  } (${template.attributes.services?.app.image})`;

const templateToChoice = (template) => ({
  name: templateName(template),
  value: template,
});

const promptApps = (installedApps) => {
  const choices = installedApps.map(templateToChoice);
  return new MultiSelect({
    name: "apps",
    message: "Select the apps you want to remove:",
    pageSize: 20,
    choices,
    result(names) {
      return choices
        .filter((choice) => names.includes(choice.name))
        .map((choice) => choice.value);
    },
  }).run();
};

const confirm = () =>
  new Confirm({
    name: "confirm",
    message: "Are you sure?",
    initial: true,
  }).run();

module.exports = async (apps, args) => {
  try {
    const { yes } = args;
    await welcomeMessage();
    const installedApps = await getInstalledApps();
    const appNames = apps?.toLowerCase()?.split(",");

    const appTemplates = appNames
      ? installedApps.filter(
          (t) =>
            appNames.includes(t.attributes.name?.toLowerCase()) ||
            appNames.includes(
              t.attributes["x-domus"]?.title?.en_us?.toLowerCase()
            )
        )
      : await promptApps(installedApps);

    if (!appTemplates.length) {
      console.log("No apps selected.");
      process.exit(0);
    }

    console.log("Will remove the following apps:");

    printTable(appTemplates);

    if (!yes) {
      const confirmed = await confirm();
      if (!confirmed) {
        process.exit(0);
      }
    }

    for (const template of appTemplates) {
      console.log('Now removing "%s"...', templateName(template));
      await stopTemplate(template);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
