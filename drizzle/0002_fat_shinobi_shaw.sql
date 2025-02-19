ALTER TABLE "expenses_categories" DROP CONSTRAINT "expenses_categories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses_categories" ADD CONSTRAINT "expenses_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;