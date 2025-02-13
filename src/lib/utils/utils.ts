import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.SALT || "10", 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

export type JWTParameters = {
  id: string;
  name: string;
  username: string;
};
export async function generateJWT(userData: JWTParameters): Promise<string> {
  const secret = process.env.SECRET!;
  return jwt.sign(userData, secret, { expiresIn: "1h" });
}
