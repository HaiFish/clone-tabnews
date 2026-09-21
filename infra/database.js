import { Client } from "pg";

const connectionErrors = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EHOSTUNREACH",
]);

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
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
  return process.env.NODE_ENV === "production" ? true : false;
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSSLValues(),
    channel_binding: process.env.POSTGRES_BINDING || "prefer",
  });

  return client.connect();
}

const database = {
  query,
  getNewClient,
};

export default database;
