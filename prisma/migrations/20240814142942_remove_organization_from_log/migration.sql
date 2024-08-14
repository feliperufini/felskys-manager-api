/*
  Warnings:

  - You are about to drop the column `organization_id` on the `logs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "register_id" TEXT NOT NULL,
    "api_route" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_logs" ("api_route", "context", "created_at", "id", "level", "message", "method", "model", "register_id", "status_code", "user_id") SELECT "api_route", "context", "created_at", "id", "level", "message", "method", "model", "register_id", "status_code", "user_id" FROM "logs";
DROP TABLE "logs";
ALTER TABLE "new_logs" RENAME TO "logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
