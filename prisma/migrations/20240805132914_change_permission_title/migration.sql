/*
  Warnings:

  - You are about to drop the column `translated_name` on the `permissions` table. All the data in the column will be lost.
  - Added the required column `title` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "website_module_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissions_website_module_id_fkey" FOREIGN KEY ("website_module_id") REFERENCES "website_modules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_permissions" ("action", "created_at", "id", "updated_at", "website_module_id") SELECT "action", "created_at", "id", "updated_at", "website_module_id" FROM "permissions";
DROP TABLE "permissions";
ALTER TABLE "new_permissions" RENAME TO "permissions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
