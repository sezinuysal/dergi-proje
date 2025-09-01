// src/lib/session.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export type JWTPayload = {
  uid: number;
  roles: string[];
};

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
