import { resolve } from "node:path";
import { runner } from "node-pg-migrate";
import database from "@/infra/database";

const defaultMigrationsOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
  dryRun: false,
  verbose: true,
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await runner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: true,
    });
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await runner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
