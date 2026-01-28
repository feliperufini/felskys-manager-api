/*
  Warnings:

  - Made the column `level` on table `logs` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "api_route" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "level" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL
);
INSERT INTO "new_logs" ("api_route", "context", "created_at", "created_by", "id", "level", "message", "method", "model") SELECT "api_route", "context", "created_at", "created_by", "id", "level", "message", "method", "model" FROM "logs";
DROP TABLE "logs";
ALTER TABLE "new_logs" RENAME TO "logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
