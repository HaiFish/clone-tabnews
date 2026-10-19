import { runner } from "node-pg-migrate";
import database from "@/infra/database";
import migrator from "@/models/migrator";

jest.mock("node-pg-migrate", () => ({
  runner: jest.fn(),
}));
jest.mock("@/infra/database", () => ({
  getNewClient: jest.fn(),
}));

describe.each([
  ["listPendingMigrations", true],
  ["runPendingMigrations", false],
])("%s", (method, dryRun) => {
  let client;

  beforeEach(() => {
    jest.resetAllMocks();
    client = { end: jest.fn().mockResolvedValue(undefined) };
    database.getNewClient.mockResolvedValue(client);
  });

  test("Closes the client after successful migrations", async () => {
    const migrations = [{ name: "create-users" }];
    runner.mockResolvedValue(migrations);

    await expect(migrator[method]()).resolves.toBe(migrations);

    expect(runner).toHaveBeenCalledWith(
      expect.objectContaining({ dbClient: client, dryRun }),
    );
    expect(client.end).toHaveBeenCalledTimes(1);
  });

  test("Closes the client when migrations fail", async () => {
    const error = new Error("Migration failed");
    runner.mockRejectedValue(error);

    await expect(migrator[method]()).rejects.toBe(error);

    expect(client.end).toHaveBeenCalledTimes(1);
  });

  test("Propagates connection errors without running migrations", async () => {
    const error = new Error("Connection failed");
    database.getNewClient.mockRejectedValue(error);

    await expect(migrator[method]()).rejects.toBe(error);

    expect(runner).not.toHaveBeenCalled();
    expect(client.end).not.toHaveBeenCalled();
  });
});
