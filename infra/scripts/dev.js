const { spawnSync, spawn } = require("child_process");

function runStep(command) {
  const result = spawnSync(command, { shell: true, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// garante que o container do Postgres é parado mesmo se o processo for interrompido (Ctrl+C, SIGTERM, etc.)
process.on("exit", () =>
  spawnSync("npm", ["run", "services:stop"], { shell: true, stdio: "inherit" }),
);
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());

runStep("npm run services:up");
runStep("npm run services:wait:database");
runStep("npm run migrations:up");

const next = spawn("npx", ["next", "dev"], { stdio: "inherit" });
next.on("exit", (code) => process.exit(code ?? 0));
