const { Confirm, MultiSelect } = require("enquirer");
const { welcomeMessage } = require("./welcome");
const { DEFAULT_APPS } = require("./constants");
const {
  execTemplate,
  printTable,
  templates,
  templatesByCategory,
} = require("./templates");
const { validatePorts } = require("./validate");

const templateName = (template) =>
  `${
    template.attributes["x-domus"]?.title?.en_us || template.attributes.name
  } (${template.attributes.services?.app.image})`;

const templateToChoice = (template) => ({
  name: templateName(template),
  value: template,
});

const choices = templates.map(templateToChoice);

const initial = choices
  .filter((t) => DEFAULT_APPS.includes(t.value.attributes.name))
  .map((t) => t.name);

const promptApps = () =>
  new MultiSelect({
    name: "apps",
    message: "Select the apps you want to install:",
    pageSize: 20,
    initial,
    choices: [
      {
        name: "= Gateway =",
        disabled: true,
        role: "separator",
      },
      ...templatesByCategory.Gateway.map(templateToChoice),
      {
        name: "= Admin =",
        disabled: true,
        role: "separator",
      },
      ...templatesByCategory.Admin.map(templateToChoice),
      {
        name: "= Productivity =",
        disabled: true,
        role: "separator",
      },
      ...templatesByCategory.Productivity.map(templateToChoice),
      {
        name: "= Entertainment =",
        disabled: true,
        role: "separator",
      },
      ...templatesByCategory.Entertainment.map(templateToChoice),
    ],
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

module.exports = async (_, { _optionValues }) => {
  try {
    const { apps, mountDir, yes } = _optionValues;
    await welcomeMessage(
      "Welcome to the Domus Installer. This tool will help you install your Domus server."
    );
    const appNames = apps?.toLowerCase()?.split(",");

    const appTemplates = appNames
      ? templates.filter(
          (t) =>
            appNames.includes(t.attributes.name?.toLowerCase()) ||
            appNames.includes(
              t.attributes["x-domus"]?.title?.en_us?.toLowerCase()
            )
        )
      : await promptApps();

    validatePorts(appTemplates);

    console.log("Will install the following apps:");

    printTable(appTemplates);

    if (!yes) {
      const confirmed = await confirm();
      if (!confirmed) {
        process.exit(0);
      }
    }

    for (const template of appTemplates) {
      console.log('Now installing "%s"...', templateName(template));
      await execTemplate(template, mountDir);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
