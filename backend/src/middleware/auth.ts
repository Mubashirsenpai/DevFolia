import type { NextFunction, Request, Response } from "express";
import { verifySession } from "../lib/session.js";

export type AuthedRequest = Request & {
  session?: { sub: string; username: string };
};

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.header("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const cookieToken = typeof req.cookies?.portfolio_session === "string"
    ? req.cookies.portfolio_session
    : null;
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = await verifySession(token);
  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }
  req.session = session;
  return next();
}
