import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismaDB";
import { verifyJwt } from "@/lib/jwt";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      logger.warn("Unauthorized request to /api/folders");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    logger.info({ userId }, "Fetching folders");

    const folders = await prismadb.folder.findMany({
      where: { userId },
      include: {
            notes: {
              orderBy: { updatedAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
    });
  
    logger.info({ userId, count: folders.length }, "Fetched folders successfully");

    return NextResponse.json(folders);
  } catch (error) {
    logger.error({ error }, "Error fetching folders");
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      logger.warn("Unauthorized request to POST /api/folders");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const { name } = await req.json();

    if (!name || !name.trim()) {
      logger.warn({ userId }, "Folder name missing in POST /api/folders");
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    logger.info({ userId, name }, "Creating folder");

    const lastFolder = await prismadb.folder.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastFolder?.order ?? 0) + 1;

    const folder = await prismadb.folder.create({
      data: {
        name: name.trim(),
        userId,
        order: nextOrder,
      },
    });

    logger.info({ userId, folderId: folder.id, name: folder.name }, "Folder created successfully");

    return NextResponse.json(folder);
  } catch (error) {
    logger.error({ error }, "Error creating folder");
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
