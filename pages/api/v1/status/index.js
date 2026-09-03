import database from "@/infra/database";

async function status(request, response) {
  let databaseStatus;

  try {
    databaseStatus = await database.query(`
      SELECT
        current_setting('server_version') AS version,
        current_setting('max_connections')::int AS max_connections,
        count(*)::int AS opened_connections
      FROM pg_stat_activity
      WHERE datname = current_database();
    `);
  } catch (error) {
    response.status(503).json({
      error: "Database unavailable",
      reason: error.reason || "query_failed",
    });
    return;
  }

  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: databaseStatus.rows[0],
    },
  });
}

export default status;
