#!/usr/bin/env node
const { Command } = require("commander");
const { add, backup, processStatus, remove } = require("../lib/node/index.js");
const pkg = require("../package.json");
const program = new Command();

program.name("domus").description(pkg.description).version(pkg.version);

program
  .command("add", { isDefault: true })
  .description("add Domus Apps")
  .argument("[apps]", "Apps to add")
  .option("--base-url <url>", "Domus base url")
  .option("-m, --mount-dir <dir>", "Mount directory")
  .option("-y, --yes", "Skip prompts")
  .action(add);

program
  .command("remove")
  .alias("rm")
  .description("Remove Domus Apps")
  .argument("[apps]", "Apps to remove")
  .option("-y, --yes", "Skip prompts")
  .action(remove);

program
  .command("status")
  .alias("ps")
  .description("Show Domus status")
  .argument("[apps]", "Apps to inspect")
  .action(processStatus);

program
  .command("backup")
  .alias("bk")
  .description("Backup Domus")
  .action(backup);

program.parse();
