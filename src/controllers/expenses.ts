/*
Add Expenses
- Check user from the request object with the auth middleware
- Validate the input {title, amount, userID(from middleware), category } query using zod based on the insert schema into expenses along with a category
    - NOT OK => Return status(400 => bad request) with a message
    - OK => proceed forward
        - check if the category is already present in the categories table if not insert it {userID, categoryName}.
        - insert expense {title, amount, userID} into expenses table
        - populate expenses_categories table 
        - Return status(201 => ok created) with a message

Add Expenses
- Check user from the request object using the auth middleware.
- Validate input {title, amount, userID (from middleware), category} using Zod based on the insert schema for expenses and category.
    - If validation fails => Return status(400 => bad request) with a detailed error message.
    - If validation succeeds => proceed:
        - Check if the category exists in the `categories` table:
            - If not, insert it {userID, categoryName}.
        - Insert the expense {title, amount, userID} into the `expenses` table.
        - Insert into the `expenses_categories` table to associate the expense with the category.
        - If all operations succeed, return status(201 => created) with a success message.
        - Use a transaction to ensure data integrity (i.e., all steps are committed or none if an error occurs).
    - In case of errors:
        - If any step fails, return an appropriate status code (400/500) with the corresponding message.

*/
import { expenseInputSchema } from "../db/schema";
import { z } from "zod";
import { Response } from "express";
import { AuthRequest } from "./authMiddleware";
import { insertAnExpense } from "../db/db-utils";

export const expenseInputData = expenseInputSchema.extend({
  category: z.string().min(3, "Please enter a valid category"),
});
export type expenseInputDataType = z.infer<typeof expenseInputData>;

export async function handleAddExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    const { title, amount, category } = req.body;
    const inputValidations = expenseInputData.safeParse({
      title,
      amount,
      category,
      userId: user?.id,
    });
    if (!inputValidations.success) {
      res.status(400).json({
        status: "failue",
        message: "Input validation failed",
        error: inputValidations.error.errors,
      });
      return;
    }
    try {
      await insertAnExpense({ title, amount, category, userId: user?.id! });
      res.status(201).json({
        status: "success",
        message: "Expense insertion successful",
      });
      return;
    } catch (error: any) {
      res.status(400).json({ status: "failure", message: error.message });
      return;
    }
  } catch (error: any) {
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      error: error.message,
    });
  }
}
