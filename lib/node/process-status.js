const { exec } = require("node:child_process");
const { printTable, templates } = require("./templates");
const { welcomeMessage } = require("./welcome");

const dockerProcessStatus = () =>
  new Promise((resolve, reject) => {
    exec(
      `docker ps -a --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Status": "{{ .Status }}"}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(error);
        }

        try {
          const validJSONString = `[${stdout.trim().replace(/\n/g, ",")}]`;
          const json = JSON.parse(validJSONString);

          resolve(json);
        } catch (error) {
          reject(error);
        }

        resolve();
      }
    );
  });

module.exports = async () => {
  await welcomeMessage("Showing process status...");

  const processes = await dockerProcessStatus();

  const installedTemplates = templates.filter((template) =>
    processes.find((container) =>
      Object.values(template.attributes.services).some(
        (service) => service.container_name === container.Names
      )
    )
  );

  for (const template of installedTemplates) {
    for (const srvc of Object.values(template.attributes.services)) {
      const { container_name } = srvc;

      const serviceContainer = processes.find(
        (container) => container.Names === container_name
      );

      if (!serviceContainer) {
        return;
      }

      const serviceStatus = serviceContainer.Status.split(" ")[0];
      srvc.status = serviceStatus;
    }

    printTable(installedTemplates);
  }
};
