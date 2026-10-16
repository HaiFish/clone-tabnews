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
  try {
    const pendingMigrations = await runner({
      ...defaultMigrationsOptions,
      dbClient: await database.getNewClient(),
      dryRun: true,
    });
    return pendingMigrations;
  } finally {
    if (defaultMigrationsOptions.dbClient) {
      await defaultMigrationsOptions.dbClient.end();
    }
  }
}

async function runPendingMigrations() {
  try {
    const migratedMigrations = await runner({
      ...defaultMigrationsOptions,
      dbClient: await database.getNewClient(),
    });
    return migratedMigrations;
  } finally {
    if (defaultMigrationsOptions.dbClient) {
      await defaultMigrationsOptions.dbClient.end();
    }
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
