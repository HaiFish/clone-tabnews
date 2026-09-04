import { Client } from "pg";

const connectionErrors = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EHOSTUNREACH",
]);

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: process.env.POSTGRES_SSL === "true",
    channel_binding: process.env.POSTGRES_BINDING,
  });

  try {
    await client.connect();
    return await client.query(queryObject);
  } catch (error) {
    if (error.code === "53300") {
      error.reason = "connection_limit";
    } else if (connectionErrors.has(error.code)) {
      error.reason = "offline";
    } else {
      error.reason = "query_failed";
    }

    throw error;
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
