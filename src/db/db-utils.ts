import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { categories, User, users } from "./schema";
import { UserLogin } from "../controllers/auth";
import { eq } from "drizzle-orm";

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
Insertion in categories
- Insert default categories into categories
*/
