import { runner } from "node-pg-migrate";
import { join } from "path";
import database from "@/infra/database";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response
      .status(405)
      .json({ error: `Method "${request.method}" not allowed` });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

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
      return response.status(200).json(migratedMigrations);
    }

    if (request.method === "GET") {
      const pendingMigrations = await runner({
        ...defaultMigrationsOptions,
        dryRun: true,
      });
      return response
        .status(pendingMigrations.length === 0 ? 200 : 201)
        .json(pendingMigrations);
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}
