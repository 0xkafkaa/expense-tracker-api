import "dotenv/config";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.SALT || "10", 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}
