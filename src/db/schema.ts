import { sql } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/*
USERS - Table
- table schema
- validation schema
- type definiton
*/
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).unique().notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(), // hashed password expected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userInsertSchema = createInsertSchema(users, {
  email: z.string().email("Please enter an email"),
  password: z
    .string()
    .min(60, "Password must be hashed before insertion into the db"),
});

export const userInputSchema = userInsertSchema.extend({
  name: z.string().min(3, "Please enter a valid username"),
  username: z.string().min(5, "Please enter a valid username"),
  password: z.string().min(8, "Password must be atleast 8 characters long"),
});

// export type User = z.infer<typeof userInsertSchema>;
export type User = typeof users.$inferInsert;

/*
Categories - Table
- table schema
 */

export const expenses = pgTable("expenses", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export const expenseInputSchema = createInsertSchema(expenses, {
  title: z.string().min(3, "Please enter a valid expense"),
  amount: z.number().gt(0, "Amount should be greater than 0"),
});

/*
Categories - Table
- table schema
 */

export const categories = pgTable(
  "categories",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    categoryName: varchar("category_name", { length: 255 }).notNull(),
  },
  (t) => [unique().on(t.userId, t.categoryName)]
);

/*
Expenses_categories - Junction table
- table schema
*/

export const expensesCategories = pgTable(
  "expenses_categories",
  {
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, {
        onDelete: "cascade",
      }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "set null",
      }),
  },
  (t) => [primaryKey({ columns: [t.expenseId, t.categoryId] })]
);
