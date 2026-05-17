const { spawnSync } = require("child_process");

console.log("Deploying slash commands...");

const deploy = spawnSync("node", ["deploy-commands.js"], {
  stdio: "inherit",
});

if (deploy.status !== 0) {
  console.error("Slash command deploy failed.");
  process.exit(1);
}

console.log("Starting bot...");

require("./index");
