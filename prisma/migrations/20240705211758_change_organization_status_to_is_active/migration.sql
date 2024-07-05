/*
  Warnings:

  - You are about to drop the column `status` on the `organizations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legal_name" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_organizations" ("business_name", "created_at", "document", "id", "legal_name", "updated_at") SELECT "business_name", "created_at", "document", "id", "legal_name", "updated_at" FROM "organizations";
DROP TABLE "organizations";
ALTER TABLE "new_organizations" RENAME TO "organizations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
