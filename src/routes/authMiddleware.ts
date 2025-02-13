/* 
Auth Middleware flow:
- Get the token from the cookie header
    - NOT OK => Return status(403 => forbidden) with a message
    - OK => proceed forward
        - decode and verify the token
        - NOT OK => Return status(401 => unauthorized) with a message
        - OK => add it in the request object
*/

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";

interface AuthRequest extends Request {
  user?: JwtPayload;
}
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(403).json({
        status: "failure",
        message: "No token provided. Access forbidden",
      });
      return;
    }
    const secret = process.env.SECRET;
    if (!secret) {
      console.error("SECRET key is not set in environment variables.");
      res
        .status(500)
        .json({ status: "failure", message: "Internal server error" });
      return;
    }
    try {
      const userInfo = jwt.verify(token, secret) as JwtPayload;
      req.user = userInfo;
      next();
      return;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({ status: "failure", message: "Token expired" });
        return;
      }
      if (error.name === "JsonWebTokenError") {
        res.status(401).json({ status: "failure", message: "Invalid token" });
        return;
      }
      res
        .status(401)
        .json({ status: "failure", message: "Unauthorized access" });
      return;
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ status: "failure", message: "Internal server error" });
  }
}
