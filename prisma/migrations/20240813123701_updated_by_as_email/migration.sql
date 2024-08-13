/*
  Warnings:

  - You are about to drop the column `updated_user_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `updated_user_id` on the `payments` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" DECIMAL NOT NULL,
    "due_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "organization_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock',
    CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_invoices" ("amount", "created_at", "due_date", "id", "organization_id", "status", "updated_at") SELECT "amount", "created_at", "due_date", "id", "organization_id", "status", "updated_at" FROM "invoices";
DROP TABLE "invoices";
ALTER TABLE "new_invoices" RENAME TO "invoices";
CREATE TABLE "new_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legal_name" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock'
);
INSERT INTO "new_organizations" ("business_name", "created_at", "document", "id", "is_active", "legal_name", "updated_at") SELECT "business_name", "created_at", "document", "id", "is_active", "legal_name", "updated_at" FROM "organizations";
DROP TABLE "organizations";
ALTER TABLE "new_organizations" RENAME TO "organizations";
CREATE UNIQUE INDEX "organizations_legal_name_key" ON "organizations"("legal_name");
CREATE UNIQUE INDEX "organizations_document_key" ON "organizations"("document");
CREATE TABLE "new_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" DECIMAL NOT NULL,
    "payment_date" DATETIME NOT NULL,
    "payment_method" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock',
    CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amount", "created_at", "id", "invoice_id", "payment_date", "payment_method", "updated_at") SELECT "amount", "created_at", "id", "invoice_id", "payment_date", "payment_method", "updated_at" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE TABLE "new_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "website_module_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock',
    CONSTRAINT "permissions_website_module_id_fkey" FOREIGN KEY ("website_module_id") REFERENCES "website_modules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_permissions" ("action", "created_at", "id", "title", "updated_at", "website_module_id") SELECT "action", "created_at", "id", "title", "updated_at", "website_module_id" FROM "permissions";
DROP TABLE "permissions";
ALTER TABLE "new_permissions" RENAME TO "permissions";
CREATE TABLE "new_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock',
    CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_roles" ("created_at", "description", "id", "name", "organization_id", "updated_at") SELECT "created_at", "description", "id", "name", "organization_id", "updated_at" FROM "roles";
DROP TABLE "roles";
ALTER TABLE "new_roles" RENAME TO "roles";
CREATE UNIQUE INDEX "roles_name_organization_id_key" ON "roles"("name", "organization_id");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock',
    CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("created_at", "email", "id", "is_active", "nickname", "password_hash", "role_id", "updated_at") SELECT "created_at", "email", "id", "is_active", "nickname", "password_hash", "role_id", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "new_website_modules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock'
);
INSERT INTO "new_website_modules" ("created_at", "id", "slug", "title", "updated_at") SELECT "created_at", "id", "slug", "title", "updated_at" FROM "website_modules";
DROP TABLE "website_modules";
ALTER TABLE "new_website_modules" RENAME TO "website_modules";
CREATE UNIQUE INDEX "website_modules_title_key" ON "website_modules"("title");
CREATE UNIQUE INDEX "website_modules_slug_key" ON "website_modules"("slug");
CREATE TABLE "new_websites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system-mock',
    CONSTRAINT "websites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_websites" ("created_at", "domain", "id", "organization_id", "title", "updated_at") SELECT "created_at", "domain", "id", "organization_id", "title", "updated_at" FROM "websites";
DROP TABLE "websites";
ALTER TABLE "new_websites" RENAME TO "websites";
CREATE UNIQUE INDEX "websites_domain_key" ON "websites"("domain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
