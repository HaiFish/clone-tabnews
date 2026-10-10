import { createRouter } from "next-connect";
import { runner } from "node-pg-migrate";
import { resolve } from "node:path";
import database from "@/infra/database";
import controllers from "@/infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controllers.errorHandlers);

const defaultMigrationsOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  migrationsTable: "pgmigrations",
  dryRun: false,
  verbose: true,
};

async function getHandler(request, response) {
  try {
    const pendingMigrations = await runner({
      ...defaultMigrationsOptions,
      dbClient: await database.getNewClient(),
      dryRun: true,
    });
    return response
      .status(pendingMigrations.length === 0 ? 200 : 201)
      .json(pendingMigrations);
  } finally {
    if (defaultMigrationsOptions.dbClient) {
      await defaultMigrationsOptions.dbClient.end();
    }
  }
}

async function postHandler(request, response) {
  try {
    const migratedMigrations = await runner({
      ...defaultMigrationsOptions,
      dbClient: await database.getNewClient(),
    });
    return response
      .status(migratedMigrations.length === 0 ? 200 : 201)
      .json(migratedMigrations);
  } finally {
    if (defaultMigrationsOptions.dbClient) {
      await defaultMigrationsOptions.dbClient.end();
    }
  }
}
