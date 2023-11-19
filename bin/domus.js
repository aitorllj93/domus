#!/usr/bin/env node
const { Command } = require("commander");
const { setup } = require("../lib/node/index.js");
const pkg = require("../package.json");
const program = new Command();

program.name("domus").description(pkg.description).version(pkg.version);

program
  .command("setup", { isDefault: true })
  .description("Setup Domus")
  .action(setup);
// program.command("install").description("Install Domus App").action(install);

program.parse(process.argv);
