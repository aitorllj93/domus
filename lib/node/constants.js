const { join } = require("node:path");

const TEMPLATES_PATH = join(__dirname, "..", "..", "portainer", "templates");
const DEFAULT_APPS = [
  "domus-launcher",
  "domus-dashboard",
  "domus-manager",
  // Home Assistant is installed outside of Docker
  //  "domus-home",
  "domus-documents",
  "domus-bookmarks",
  "domus-food",
  "domus-media",
  "domus-books",
  "domus-audios",
  "domus-photos",
  "domus-media-provider-yt",
];

module.exports = {
  TEMPLATES_PATH,
  DEFAULT_APPS,
};
