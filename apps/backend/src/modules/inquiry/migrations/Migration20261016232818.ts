import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261016232818 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "inquiry" ("id" text not null, "type" text check ("type" in ('quote_sample', 'contact', 'supplier_registration')) not null, "status" text check ("status" in ('new', 'in_progress', 'closed')) not null default 'new', "name" text not null, "email" text not null, "phone" text null, "company" text null, "message" text null, "customer_id" text null, "product_id" text null, "variant_id" text null, "quantity" integer null, "unit" text null, "wants_quote" boolean not null default false, "wants_sample" boolean not null default false, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "inquiry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_inquiry_deleted_at" ON "inquiry" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "inquiry" cascade;`);
  }

}
