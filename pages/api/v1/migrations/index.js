import { runner } from "node-pg-migrate";
import { join } from "path";
import database from "@/infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationsOptions = {
    dbClient,
    dir: join("infra", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
    dryRun: false,
    verbose: true,
  };
  if (request.method === "POST") {
    const migratedMigrations = await runner({
      ...defaultMigrationsOptions,
    });
    await dbClient.end();
    return response.status(200).json(migratedMigrations);
  }

  if (request.method === "GET") {
    const pendingMigrations = await runner({
      ...defaultMigrationsOptions,
      dryRun: true,
    });
    await dbClient.end();
    return response
      .status(pendingMigrations.length === 0 ? 200 : 201)
      .json(pendingMigrations);
  }

  return response.status(405).json({ error: "Method not allowed" });
}
