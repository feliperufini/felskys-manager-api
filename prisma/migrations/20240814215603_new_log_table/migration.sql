/*
  Warnings:

  - You are about to drop the column `context` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `status_code` on the `logs` table. All the data in the column will be lost.

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
    "old_context" TEXT,
    "new_context" TEXT,
    "level" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    CONSTRAINT "logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_logs" ("api_route", "created_at", "created_by", "id", "level", "message", "method", "model", "register_id") SELECT "api_route", "created_at", "created_by", "id", "level", "message", "method", "model", "register_id" FROM "logs";
DROP TABLE "logs";
ALTER TABLE "new_logs" RENAME TO "logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
