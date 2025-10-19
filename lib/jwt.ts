import jwt, { JwtPayload } from "jsonwebtoken";


const SECRET = process.env.JWT_SECRET!;

export interface AuthTokenPayload extends JwtPayload {
  userId: number;
}


export function signJwt(payload: AuthTokenPayload){
    return jwt.sign(payload, SECRET, { expiresIn: "7d" })
}

export function verifyJwt(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as AuthTokenPayload;
}