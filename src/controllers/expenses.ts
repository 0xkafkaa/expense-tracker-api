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
import {
  deleteAnExpense,
  getAllExpenses,
  insertAnExpense,
} from "../db/db-utils";

export const expenseInputData = expenseInputSchema.extend({
  category: z.string().min(3, "Please enter a valid category"),
  date: z.string().date(),
});
export type expenseInputDataType = z.infer<typeof expenseInputData>;

export async function handleAddExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    const { title, amount, category, date } = req.body;
    const inputValidations = expenseInputData.safeParse({
      title,
      amount,
      category,
      userId: user?.id,
    });
    if (!inputValidations.success) {
      res.status(400).json({
        status: "failure",
        message: "Input validation failed",
        error: inputValidations.error.errors,
      });
      return;
    }
    try {
      await insertAnExpense({
        title,
        amount,
        category,
        userId: user?.id!,
        date,
      });
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
/*
Delete an expense
- Check user from the request object using the auth middleware.
- Validate input {id, userId(from middleware)} using Zod.
    - If validation fails => Return status(400 => bad request) with a detailed error message.
    - If validation succeeds => proceed:
        - Check whether an expense with the id exists for the user.
          - If not exists => Return status(400 => bad request) with a message 'Expense doesn't exist'
          - If does exist => delete it from expenses.
    - In case of errors:
        - If any step fails, return an appropriate status code (400/500) with the corresponding message.
*/

const expenseDeleteInput = z.object({
  userId: z.string().uuid("Not a valid user"),
  expenseId: z.string().uuid("Not a valid expense"),
});
export type expenseDeleteData = z.infer<typeof expenseDeleteInput>;
export async function handleDeleteExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    const { expenseId } = req.body;
    const inputValidation = expenseDeleteInput.safeParse({
      userId: user?.id,
      expenseId,
    });
    if (!inputValidation.success) {
      res
        .status(400)
        .json({ status: "failure", message: "Input validation failed" });
      return;
    }
    try {
      await deleteAnExpense({ userId: user?.id!, expenseId });
      res.status(204).json({
        status: "success",
        message: "Expense delete successful",
      });
      return;
    } catch (error: any) {
      res.status(404).json({ status: "failure", message: error.message });
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

/*
Get all expenses
- Check user from the request object using the auth middleware.
  - If validation succeeds => proceed:
  - In case of errors:
    - If any step fails, return an appropriate status code (400/500) with the corresponding message.
*/

export async function handleGetExpenses(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res
        .status(400)
        .json({ status: "failure", message: "User validation failed" });
      return;
    }
    try {
      const expenseData = await getAllExpenses(user.id);
      res.status(200).json({
        status: "success",
        message: "Expense get successful",
        data: expenseData,
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
