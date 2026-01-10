import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
  logger.info("User logged out");
  return res;
}
