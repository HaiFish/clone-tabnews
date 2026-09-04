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
    ssl: getSSLValues(),
    channel_binding: process.env.POSTGRES_BINDING || "prefer",
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

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV === "development" ? false : true;
}

export default {
  query: query,
};
