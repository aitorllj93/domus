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

const { DEFAULT_APPS, TEMPLATES_PATH } = require("./constants");

const TMP_PATH = tmpdir();

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

const execTemplate = (template, mountDir) => {
  let content = template.content
    .replace("$PUID", 1000)
    .replace("$PGID", 1000)
    .replace("$TZ", "Europe/Madrid");

  if (mountDir) {
    content = content.replace("/DATA", mountDir);
  }

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

  const tmpPath = mkdtempSync(`${TMP_PATH}${sep}`);

  writeFileSync(join(tmpPath, "docker-compose.yml"), content, "utf8");

  exec("docker compose up -d", { cwd: tmpPath }, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(stderr);
      return;
    }

    console.log(stdout);
  });
};

const serviceName = (template, name) =>
  `${template.attributes["x-domus"]?.title?.en_us ?? template.attributes.name}${
    name !== "app" ? ` - ${name}` : ""
  }`;

const toTable = (templates) => {
  const apps = templates
    .map((template) =>
      Object.entries(template.attributes.services).map(([name, service]) => ({
        name: serviceName(template, name),
        image: service.image,
        ports: service.ports.map((p) => parseInt(p.published)),
        media: service.volumes
          ?.map((v) => (typeof v === "string" ? v.split(":")?.[0] : v.source))
          .filter((v) => v.startsWith("/DATA/Media/"))
          .map((v) => v.replace("/DATA/Media/", "")),
      }))
    )
    .flat(Infinity);

  return apps;
};

const tableToPrint = (table) => {
  const tableStr = table.map((e) => ({
    ...e,
    ports: e.ports.join(","),
    media: e.media.join(","),
  }));

  return tableStr;
};

const printTable = (templates) => {
  const table = toTable(templates);

  console.table(tableToPrint(table));
};

module.exports = {
  execTemplate,
  printTable,
  serviceName,
  templates,
  templatesByCategory,
  tableToPrint,
  toTable,
  DEFAULT_APPS,
  TEMPLATES_PATH,
};
