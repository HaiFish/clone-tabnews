import { createRouter } from "next-connect";
import database from "@/infra/database";
import controllers from "@/infra/controller";

const router = createRouter();

router.get(getHandler);

export default router.handler(controllers.errorHandlers);

async function getHandler(request, response) {
  let databaseStatus;

  databaseStatus = await database.query(`
      SELECT
        current_setting('server_version') AS version,
        current_setting('max_connections')::int AS max_connections,
        count(*)::int AS opened_connections
      FROM pg_stat_activity
      WHERE datname = current_database();
    `);

  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: databaseStatus.rows[0],
    },
  });
}
