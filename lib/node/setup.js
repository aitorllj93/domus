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

module.exports = () => {
  welcomeMessage();

  setTimeout(() => {
    promptApps()
      .then((appTemplates) => {
        validatePorts(appTemplates);

        console.log("Will install the following apps:");

        printTable(appTemplates);

        return confirm().then((confirmed) => {
          if (!confirmed) {
            process.exit(0);
          }

          return appTemplates;
        });
      })
      .then((appTemplates) => {
        for (const template of appTemplates) {
          console.log('Now installing "%s"...', templateName(template));
          return execTemplate(template);
        }
      })
      .catch((err) => process.exit(1));
  }, 500);
};
