#!/usr/bin/env node
const { Command } = require("commander");
const { backup, setup } = require("../lib/node/index.js");
const pkg = require("../package.json");
const program = new Command();

program.name("domus").description(pkg.description).version(pkg.version);

program
  .command("setup", { isDefault: true })
  .description("Setup Domus")
  .option("--base-url <url>", "Domus base url")
  .option("-a, --apps <names>", "Apps to install")
  .option("-m, --mount-dir <dir>", "Mount directory")
  .option("-y, --yes", "Skip prompts")
  .action(setup);
// program.command("install").description("Install Domus App").action(install);
program.command("backup").description("Backup Domus").action(backup);

program.parse();
