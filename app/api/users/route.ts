import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import prismadb from "@/lib/prismaDB";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      logger.warn("Unauthorized request to /api/user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const user = await prismadb.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logger.info(`User details fetched for userId: ${userId}`);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    logger.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}