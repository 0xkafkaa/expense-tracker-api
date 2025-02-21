import { Request, Response } from "express";
import { userInputSchema, userInsertSchema } from "../db/schema";
import { comparePassword, generateJWT, hashPassword } from "../lib/utils/utils";
import { getAUser, insertIntoUsers, UserFromSelect } from "../db/db-utils";
import { z } from "zod";

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
    const inputValidation = userInputSchema.safeParse(req.body);
    if (!inputValidation.success) {
      res.status(400).json({
        status: "failure",
        message: "Input validation failed",
        error: inputValidation.error.errors,
      });
      return;
    }
    const { name, username, email, password } = inputValidation.data;
    // hash password
    const hashedPassword = await hashPassword(password);

    // input validation for db insert using drizzle zod
    const insertValidation = userInsertSchema.safeParse({
      name,
      username,
      email,
      password: hashedPassword,
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
        message: "User signup successful",
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
/*
User Login flow
- Get the credentials (name, password)
- Validate the credentials with zod
    - NOT OK => Return status(400 => bad request) with a message
    - OK => proceed forward
        - get hashed password from db
        - compare password with hashed password
          - NOT OK => Return status(401 => unauthorized) with a message
          - OK => proceed forward
              - generate jwt based on (name, username, id)
              - store the token in the cookie header
              - Return status(200 => ok) with a message
*/

const userLoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be atleast 8 characters long"),
});
export type UserLogin = z.infer<typeof userLoginInput>;
export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    const inputValidation = userLoginInput.safeParse(req.body);
    if (!inputValidation.success) {
      res.status(400).json({
        status: "failure",
        message: "Input validation failed",
        error: inputValidation.error.errors,
      });
      return;
    }
    const { email, password } = inputValidation.data!;
    try {
      const user: UserFromSelect = await getAUser(email);
      const isMatch = await comparePassword(password, user.hashedPassword);
      if (!isMatch) {
        res
          .status(401)
          .json({ status: "failure", message: "Incorrect Password" });
        return;
      }

      const token = await generateJWT({
        id: user.id,
        name: user.name,
        username: user.username,
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
        sameSite: "strict",
      });
      res.status(200).json({
        status: "success",
        message: "User login successful",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: email, // Include email if necessary
        },
      });
    } catch (error: any) {
      if (error.message.includes("User doesn't exist")) {
        res.status(400).json({ status: "failure", message: error.message });
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
