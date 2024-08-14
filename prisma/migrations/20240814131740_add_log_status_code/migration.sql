/*
  Warnings:

  - Added the required column `status_code` to the `logs` table without a default value. This is not possible if the table is not empty.

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
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_logs" ("api_route", "context", "created_at", "id", "level", "message", "method", "model", "organization_id", "register_id", "user_id") SELECT "api_route", "context", "created_at", "id", "level", "message", "method", "model", "organization_id", "register_id", "user_id" FROM "logs";
DROP TABLE "logs";
ALTER TABLE "new_logs" RENAME TO "logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
