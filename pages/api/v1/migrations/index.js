import { createRouter } from "next-connect";
import controllers from "@/infra/controller";
import migrator from "@/models/migrator";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controllers.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response
    .status(pendingMigrations.length === 0 ? 200 : 201)
    .json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();
  return response
    .status(migratedMigrations.length === 0 ? 200 : 201)
    .json(migratedMigrations);
}
