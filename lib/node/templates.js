const { exec, execSync } = require("node:child_process");
const { tmpdir } = require("node:os");
const {
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} = require("node:fs");
const { dirname, join, sep } = require("node:path");
const { parse } = require("yaml");
const term = require("terminal-kit").terminal;

const { DEFAULT_APPS, TEMPLATES_PATH } = require("./constants");

const TMP_PATH = tmpdir();

const STATUS_ICONS = {
  Up: "🟢",
  Restarting: "🟡",
  Exited: "🔴",
};

const readFileRecursive = (path) => {
  const files = readdirSync(path);
  return files.map((file) => {
    const filePath = join(path, file);
    const isDirectory = lstatSync(filePath).isDirectory();
    if (isDirectory) {
      return readFileRecursive(filePath);
    }

    if (file !== "docker-compose.yml") {
      return [];
    }

    const content = readFileSync(filePath, "utf8");
    const attributes = parse(content);

    return {
      path: dirname(filePath),
      content,
      attributes,
    };
  });
};

const templates = readFileRecursive(TEMPLATES_PATH)
  .flat(Infinity)
  .sort((a, b) => {
    const aIndex = DEFAULT_APPS.indexOf(a.attributes.name);
    const bIndex = DEFAULT_APPS.indexOf(b.attributes.name);
    if (aIndex === -1 && bIndex === -1) {
      return 0;
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

const getTemplatesByCategory = (category) =>
  templates.filter((t) => t.attributes["x-domus"]?.category === category);

const templatesByCategory = {
  Gateway: getTemplatesByCategory("Gateway"),
  Admin: getTemplatesByCategory("Admin"),
  Productivity: getTemplatesByCategory("Productivity"),
  Entertainment: getTemplatesByCategory("Entertainment"),
};

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

const getInstalledApps = async () => {
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
  }

  return installedTemplates;
};

const ensureVolumesExist = (template, mountDir) => {
  const volumes = Object.values(template.attributes.services)
    .map((s) => s.volumes)
    .flat(Infinity);

  for (const volume of volumes) {
    if (typeof volume === "string") {
      return;
    }

    const source = mountDir
      ? volume.source.replace("/DATA", mountDir)
      : volume.source;
    const exists = lstatSync(source, {
      throwIfNoEntry: false,
    })?.isDirectory();
    if (!exists) {
      console.log(`Creating volume ${source}`);
      mkdirSync(source, { recursive: true });
    }
  }
};

const generateComposeFile = (template, mountDir) => {
  let content = template.content
    .replace("$PUID", 1000)
    .replace("$PGID", 1000)
    .replace("$TZ", "Europe/Madrid");

  if (mountDir) {
    content = content.replace("/DATA", mountDir);
  }

  const tmpPath = mkdtempSync(`${TMP_PATH}${sep}`);

  writeFileSync(join(tmpPath, "docker-compose.yml"), content, "utf8");

  return tmpPath;
};

const execTemplate = (template, mountDir) => {
  const composePath = generateComposeFile(template, mountDir);

  ensureVolumesExist(template, mountDir);

  const templateDataPath = join(template.path, "data");
  const templateHasDataFolder = lstatSync(templateDataPath, {
    throwIfNoEntry: false,
  })?.isDirectory();

  if (templateHasDataFolder) {
    const dataVolumes = template.attributes.services.app.volumes.filter((v) =>
      v.source.includes("AppData")
    );

    if (dataVolumes) {
      for (const volume of dataVolumes) {
        const volumeMountDir = mountDir
          ? volume.source.replace("/DATA", mountDir)
          : volume.source;
        const isEmpty = readdirSync(volumeMountDir).length === 0;

        if (!isEmpty) {
          continue;
        }

        const volumeFolderName = volume.source.split("/").pop();

        const templateDataVolumeFolderPath = join(
          templateDataPath,
          volumeFolderName
        );

        const volumeFolderExistsInTemplateData = lstatSync(
          templateDataVolumeFolderPath,
          {
            throwIfNoEntry: false,
          }
        )?.isDirectory();

        if (!volumeFolderExistsInTemplateData) {
          continue;
        }

        console.log(
          `Copying data from template ${templateDataVolumeFolderPath}`
        );

        execSync(`cp -r ${templateDataVolumeFolderPath}/* ${volumeMountDir}`);
      }
    }
  }

  exec(
    "docker compose up -d",
    { cwd: composePath },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(stderr);
        return;
      }

      console.log(stdout);
    }
  );
};

const stopTemplate = (template, mountDir) => {
  const composePath = generateComposeFile(template, mountDir);

  execSync("docker compose down", { cwd: composePath });
};

const serviceName = (template, name) =>
  `${template.attributes["x-domus"]?.title?.en_us ?? template.attributes.name}${
    name !== "app" ? ` - ${name}` : ""
  }`;

const toTable = (templates) => {
  const apps = templates
    .map((template) =>
      Object.entries(template.attributes.services).map(([name, service]) => {
        const rowName = `${
          template.attributes?.["x-domus"]?.emoji
        } ${serviceName(template, name)}`;
        const { image, ports, volumes } = service;
        const rowPorts = ports?.map((p) => parseInt(p.published)) ?? [];
        const media =
          volumes
            ?.map((v) => (typeof v === "string" ? v.split(":")?.[0] : v.source))
            .filter((v) => v.startsWith("/DATA/Media/"))
            .map((v) => v.replace("/DATA/Media/", "")) ?? [];

        const tableRow = {
          name: rowName,
          image,
        };

        if (rowPorts.length) {
          tableRow.ports = rowPorts;
        }

        if (media.length) {
          tableRow.media = media;
        }

        if (service.status) {
          tableRow.status = STATUS_ICONS[service.status] ?? service.status;
        }

        return tableRow;
      })
    )
    .flat(Infinity);

  return apps;
};

const tableToPrint = (table) => {
  const tableStr = table.map((e) => {
    const ports = e.ports?.join(",");
    const media = e.media?.join(",");

    const row = JSON.parse(JSON.stringify(e));
    delete row.ports;
    delete row.media;

    if (ports) {
      row.ports = ports;
    }

    if (media) {
      row.media = media;
    }

    return row;
  });

  return tableStr;
};

const printTable = (templates) => {
  if (!templates.length) {
    console.log("No apps found");
    return;
  }

  const table = toTable(templates);

  const headers = ["name", "image", "ports", "media", "status"];

  term.table([headers, ...table.map((row) => headers.map((h) => row[h]))], {
    hasBorder: true,
    borderChars: "lightRounded",
    borderAttr: { color: "cyan" },
    firstRowTextAttr: { bgColor: "cyan", color: "black" },
    expandToWidth: false,
  });
};

module.exports = {
  execTemplate,
  getInstalledApps,
  printTable,
  serviceName,
  stopTemplate,
  templates,
  templatesByCategory,
  tableToPrint,
  toTable,
  DEFAULT_APPS,
  TEMPLATES_PATH,
};
