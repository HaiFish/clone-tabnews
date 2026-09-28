const { spawnSync, spawn } = require("child_process");

// garante que o container do Postgres é parado mesmo se o processo for interrompido (Ctrl+C, SIGTERM, etc.)
process.on("exit", () =>
  spawnSync("npm", ["run", "services:stop"], { shell: true, stdio: "inherit" }),
);
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());

const up = spawnSync("npm", ["run", "services:up"], {
  shell: true,
  stdio: "inherit",
});
if (up.status !== 0) {
  process.exit(up.status ?? 1);
}

const test = spawn(
  "npx",
  [
    "concurrently",
    "-n",
    "next,jest",
    "--hide",
    "next",
    "-k",
    "-s",
    "command-jest",
    "next dev",
    "jest --runInBand",
  ],
  { stdio: "inherit" },
);
test.on("exit", (code) => process.exit(code ?? 0));
