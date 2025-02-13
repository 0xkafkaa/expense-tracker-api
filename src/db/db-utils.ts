import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { User, users } from "./schema";

const db = drizzle(process.env.DATABASE_URL!);

/*
Users related queries
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
