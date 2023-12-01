const { Confirm, MultiSelect } = require("enquirer");
const { welcomeMessage } = require("./welcome");
const { DEFAULT_APPS } = require("./constants");
const {
  execTemplate,
  printTable,
  templates,
  getInstalledApps,
} = require("./templates");
const { validatePorts } = require("./validate");

const templateName = (template) =>
  `${template.attributes["x-domus"]?.emoji} ${
    template.attributes["x-domus"]?.title?.en_us || template.attributes.name
  } (${template.attributes.services?.app.image})`;

const templateToChoice = (template) => ({
  name: templateName(template),
  value: template,
});

const promptApps = (choices, initial) =>
  new MultiSelect({
    name: "apps",
    message: "Select the apps you want to add:",
    pageSize: 20,
    initial,
    choices,
    result(names) {
      return choices
        .filter((choice) => names.includes(choice.name))
        .map((choice) => choice.value);
    },
  }).run();

const confirm = () =>
  new Confirm({
    name: "confirm",
    message: "Are you sure?",
    initial: true,
  }).run();

module.exports = async (apps, args) => {
  try {
    const { mountDir, yes } = args;
    await welcomeMessage(
      "Welcome to the Domus. This tool will help you adding applications to your server."
    );
    const appNames = apps?.toLowerCase()?.split(",");

    const installedApps = await getInstalledApps();

    const choices = templates
      .filter(
        (t) =>
          !installedApps.some(
            (app) => app.attributes.name === t.attributes.name
          )
      )
      .map(templateToChoice);

    const initial = choices
      .filter((t) => DEFAULT_APPS.includes(t.value.attributes.name))
      .map((t) => t.name);

    const appTemplates = appNames
      ? templates.filter(
          (t) =>
            appNames.includes(t.attributes.name?.toLowerCase()) ||
            appNames.includes(
              t.attributes["x-domus"]?.title?.en_us?.toLowerCase()
            )
        )
      : await promptApps(choices, initial);

    if (!appTemplates.length) {
      console.log("No apps selected.");
      process.exit(0);
    }

    validatePorts(appTemplates);

    console.log("Will add the following apps:");

    printTable(appTemplates);

    if (!yes) {
      const confirmed = await confirm();
      if (!confirmed) {
        process.exit(0);
      }
    }

    for (const template of appTemplates) {
      console.log('Now adding "%s"...', templateName(template));
      await execTemplate(template, mountDir);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
