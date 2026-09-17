const { exec } = require("child_process");

function checkPostgres() {
  exec(
    "docker exec postgres-dev pg_isready --host localhost",
    (error, stdout) => {
      if (stdout.search("accepting connections") === -1) {
        process.stdout.write(".");
        setTimeout(checkPostgres, 100);
        return;
      }
      console.log("\n🟢 Postgres está aceitando conexões!\n");
    },
  );
}

console.log("\n\n🔴 Aguardando Postgres aceitar conexões!");
checkPostgres();
