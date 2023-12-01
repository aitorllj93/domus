#!/usr/bin/env node
const { Command } = require("commander");
const { backup, processStatus, setup, stop } = require("../lib/node/index.js");
const pkg = require("../package.json");
const program = new Command();

program.name("domus").description(pkg.description).version(pkg.version);

program
  .command("install", { isDefault: true })
  .description("Install Domus")
  .option("--base-url <url>", "Domus base url")
  .option("-a, --apps <names>", "Apps to install")
  .option("-m, --mount-dir <dir>", "Mount directory")
  .option("-y, --yes", "Skip prompts")
  .action(setup);

program
  .command("stop")
  .description("Stop Domus Apps")
  .option("-a, --apps <names>", "Apps to install")
  .option("-y, --yes", "Skip prompts")
  .action(stop);

program
  .command("status")
  .alias("ps")
  .description("Show Domus status")
  .action(processStatus);

program
  .command("backup")
  .alias("bk")
  .description("Backup Domus")
  .action(backup);

program.parse();
