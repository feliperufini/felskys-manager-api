/*
  Warnings:

  - You are about to drop the column `user_id` on the `logs` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `logs` table without a default value. This is not possible if the table is not empty.

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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    CONSTRAINT "logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_logs" ("api_route", "context", "created_at", "id", "level", "message", "method", "model", "register_id", "status_code") SELECT "api_route", "context", "created_at", "id", "level", "message", "method", "model", "register_id", "status_code" FROM "logs";
DROP TABLE "logs";
ALTER TABLE "new_logs" RENAME TO "logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
