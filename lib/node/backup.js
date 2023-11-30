const { exec } = require("node:child_process");
const { join } = require("node:path");

const shellPath = __dirname.replace("node", "sh");
const scriptPath = join(shellPath, "backup.sh");

module.exports = async () => {
  return new Promise((resolve, reject) => {
    exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      resolve();
    });
  });
};
