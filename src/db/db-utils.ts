import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  categories,
  expenses,
  expensesCategories,
  User,
  users,
} from "./schema";
import { UserLogin } from "../controllers/auth";
import { eq, and, or, isNull, gte, sql } from "drizzle-orm";
import { expenseDeleteData } from "../controllers/expenses";

const db = drizzle(process.env.DATABASE_URL!);

/*
Users related query
- Insert query for users
*/

export async function insertIntoUsers(userData: User): Promise<void> {
  try {
    await db.insert(users).values(userData);
    return;
  } catch (error: any) {
    if (error.message.includes("duplicate key")) {
      throw new Error(
        "User already exists. Please use a different email or a username."
      );
    }
    throw new Error("An unexpected DB error occured while inserting the user.");
  }
}

/*
Users related query
- Get the user from users
*/
export type UserFromSelect = {
  id: string;
  name: string;
  username: string;
  hashedPassword: string;
};
export async function getAUser(email: string): Promise<UserFromSelect> {
  try {
    const data = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        hashedPassword: users.password,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!data[0]) {
      throw new Error("User doesn't exist. Please sign up.");
    }
    return data[0];
  } catch (error: any) {
    if (error.message.includes("User doesn't exist")) {
      throw error;
    }
    throw new Error("An unexpected DB error occured while selecting the user.");
  }
}

/*
Adding an expense
- check whether the category already present in categories table
  - NOT OK => Insert into category and proceed forward
  - OK => Proceed forward
*/

export type addExpenseInput = {
  title: string;
  amount: number;
  userId: string;
  category: string;
  date: string;
};
export async function insertAnExpense(
  expenseData: addExpenseInput
): Promise<void> {
  try {
    const result = await db.transaction(async (tx) => {
      const categoriesFromSelect = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(
          and(
            or(
              eq(categories.userId, expenseData.userId),
              isNull(categories.userId)
            ),
            eq(categories.categoryName, expenseData.category)
          )
        )
        .limit(1);

      let category = categoriesFromSelect[0] ?? null;

      let categoryId;
      if (!category) {
        const insertedCategory = await tx
          .insert(categories)
          .values({
            userId: expenseData.userId,
            categoryName: expenseData.category,
          })
          .returning({ id: categories.id });
        categoryId = insertedCategory[0].id;
      } else categoryId = category.id;

      const insertedExpense = await tx
        .insert(expenses)
        .values({
          title: expenseData.title,
          amount: expenseData.amount,
          userId: expenseData.userId,
          date: expenseData.date,
        })
        .returning({ id: expenses.id });
      const expenseId = insertedExpense[0].id;

      await tx.insert(expensesCategories).values({ categoryId, expenseId });
    });
  } catch (error: any) {
    throw new Error("Failed to insert expense. Please try again.");
  }
}

/*
Deleting an expense
- check if the expense exists on the user
  - OK - Delete the expense
  - NOT OK - Throw an error (expense doesn't exist)  
*/

export async function deleteAnExpense(
  expenseData: expenseDeleteData
): Promise<void> {
  try {
    const result = await db.transaction(async (tx) => {
      const expensesFromSelect = await tx
        .select({ expenseId: expenses.id })
        .from(expenses)
        .where(
          and(
            eq(expenses.id, expenseData.expenseId),
            eq(expenses.userId, expenseData.userId)
          )
        )
        .limit(1);
      const expense = expensesFromSelect[0] ?? null;
      if (!expense) {
        throw new Error("Expense doesn't exist");
      }
      await tx
        .delete(expenses)
        .where(
          and(
            eq(expenses.id, expenseData.expenseId),
            eq(expenses.userId, expenseData.userId)
          )
        );
    });
  } catch (error) {
    throw error;
  }
}

/*
Get all expenses
- pass the userID as the argument
- get all the expenses with their tags
*/

// type expense = typeof expenses.$inferSelect;

type expense = {
  date: string;
  id: string;
  title: string;
  amount: number;
  categoryName: string | null;
};
// export async function getAllExpenses(id: string): Promise<expense[]> {
//   try {
//     const data = await db
//       .select({
//         id: expenses.id,
//         title: expenses.title,
//         amount: expenses.amount,
//         date: expenses.date,
//         categoryName: categories.categoryName,
//       })
//       .from(expenses)
//       .where(eq(expenses.userId, id))
//       .leftJoin(
//         expensesCategories,
//         eq(expenses.id, expensesCategories.expenseId)
//       )
//       .leftJoin(categories, eq(expensesCategories.categoryId, categories.id));
//     return data;
//   } catch (error: any) {
//     throw new Error(error.message);
//   }
// }

export async function getAllExpenses(
  userId: string,
  filter?: "weekly" | "monthly"
): Promise<expense[]> {
  try {
    let query = db
      .select({
        id: expenses.id,
        title: expenses.title,
        amount: expenses.amount,
        date: expenses.date,
        categoryName: categories.categoryName,
      })
      .from(expenses)
      .leftJoin(
        expensesCategories,
        eq(expenses.id, expensesCategories.expenseId)
      )
      .leftJoin(categories, eq(expensesCategories.categoryId, categories.id))
      .where(eq(expenses.userId, userId)); // Initial filter for user ID

    // Additional filters based on 'filter' argument
    if (filter === "weekly") {
      query = db
        .select({
          id: expenses.id,
          title: expenses.title,
          amount: expenses.amount,
          date: expenses.date,
          categoryName: categories.categoryName,
        })
        .from(expenses)
        .leftJoin(
          expensesCategories,
          eq(expenses.id, expensesCategories.expenseId)
        )
        .leftJoin(categories, eq(expensesCategories.categoryId, categories.id))
        .where(
          and(
            eq(expenses.userId, userId),
            gte(expenses.date, sql`CURRENT_DATE - INTERVAL '7 days'`)
          )
        );
    } else if (filter === "monthly") {
      query = db
        .select({
          id: expenses.id,
          title: expenses.title,
          amount: expenses.amount,
          date: expenses.date,
          categoryName: categories.categoryName,
        })
        .from(expenses)
        .leftJoin(
          expensesCategories,
          eq(expenses.id, expensesCategories.expenseId)
        )
        .leftJoin(categories, eq(expensesCategories.categoryId, categories.id))
        .where(
          and(
            eq(expenses.userId, userId),
            gte(expenses.date, sql`CURRENT_DATE - INTERVAL '1 month'`)
          )
        );
    }
    const data = query.execute();
    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
