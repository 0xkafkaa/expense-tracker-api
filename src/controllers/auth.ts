import { Request, Response } from "express";
import { userInputSchema, userInsertSchema } from "../db/schema";
import { hashPassword } from "../lib/utils/utils";
import { insertIntoUsers } from "../db/db-utils";

/*
User Sign up flow
- Get the credentials
- Validate the credentials
    - NOT OK => Return status(400 => bad request) with a message
    - OK => proceed forward
        - Hash the password
        - Store the credentials in the DB
        - Return status(201 => ok created) with a message
*/
export async function handleSignUp(req: Request, res: Response): Promise<void> {
  try {
    // input validation using zod
    const validation = userInputSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        status: "failure",
        message: "Input validation failed",
        error: validation.error.errors,
      });
      return;
    }
    const { name, username, email, password } = validation.data;
    // hash password
    const hashedPassword = await hashPassword(password);
    // input validation for db insert using drizzle zod
    const insertValidation = userInsertSchema.safeParse({
      name,
      username,
      email,
      hashedPassword,
    });
    if (!insertValidation.success) {
      res.status(400).json({
        status: "failure",
        message: "Failed to insert into table",
        error: insertValidation.error.errors,
      });
      return;
    }
    // insert into db
    try {
      await insertIntoUsers({
        name,
        username,
        email,
        password: hashedPassword,
      });
      res.status(201).json({
        status: "success",
        message: "User successfully created",
      });
      return;
    } catch (error: any) {
      if (error.message.includes("User already exists")) {
        res.status(409).json({ status: "failure", message: error.message });
        return;
      }
      res.status(500).json({ status: "failure", message: error.message });
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
