import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismaDB";
import { verifyJwt } from "@/lib/jwt";
import logger from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const startTime = Date.now();
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      logger.warn("Unauthorized PATCH attempt to folder");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const folderId = parseInt(id);
    if (Number.isNaN(folderId)) {
      logger.warn({ userId, folderId }, "Invalid folder id");
      return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
    }

    const { name, order: requestedOrder } = await req.json();

    const existingFolder = await prismadb.folder.findUnique({
      where: { id: folderId },
      select: { id: true, userId: true, order: true },
    });

    if (!existingFolder || existingFolder.userId !== userId) {
      logger.warn({ userId, folderId }, "Folder not found or unauthorized access");
      return NextResponse.json({ error: "Folder not found or unauthorized" }, { status: 404 });
    }

    const hasOrderUpdate = typeof requestedOrder === "number";
    if (!hasOrderUpdate) {
      const updated = await prismadb.folder.update({
        where: { id: folderId, userId },
        data: { ...(name ? { name: name.trim() } : {}) },
      });
      logger.info({ userId, folderId }, "Folder updated without order change");
      return NextResponse.json(updated);
    }

    let newOrder = Math.max(1, Math.floor(requestedOrder));

    const maxRes = await prismadb.folder.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const maxOrder = maxRes?.order ?? 0;
    newOrder = Math.min(newOrder, maxOrder);

    const currentOrder = existingFolder.order;
    if (newOrder === currentOrder) {
      const updated = await prismadb.folder.update({
        where: { id: folderId },
        data: { ...(name ? { name: name.trim() } : {}) },
      });
      logger.info({ userId, folderId }, "Folder updated with name only, order unchanged");
      return NextResponse.json(updated);
    }

    const updatedFolder = await prismadb.$transaction(async (tx) => {
      const direction = newOrder > currentOrder ? "down" : "up";
      if (direction === "down") {
        await tx.folder.updateMany({
          where: {
            userId,
            order: { gt: currentOrder, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        await tx.folder.updateMany({
          where: {
            userId,
            order: { gte: newOrder, lt: currentOrder },
          },
          data: { order: { increment: 1 } },
        });
      }

      const updated = await tx.folder.update({
        where: { id: folderId },
        data: {
          order: newOrder,
          ...(name ? { name: name.trim() } : {}),
        },
      });

      return updated;
    });

    logger.info({ userId, folderId, currentOrder, newOrder }, "Folder reordered successfully");
    logger.debug({ elapsedMs: Date.now() - startTime }, "PATCH folder execution time");
    return NextResponse.json(updatedFolder);
  } catch (err) {
    logger.error({ error: err }, "Error updating folder");
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      logger.warn("Unauthorized DELETE attempt to folder");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const folderId = parseInt(id);
    if (isNaN(folderId)) {
      logger.warn({ userId, folderId }, "Invalid folder ID for delete");
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    const folder = await prismadb.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      logger.warn({ userId, folderId }, "Folder not found for deletion");
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    await prismadb.$transaction(async (tx) => {
      await tx.folder.delete({ where: { id: folderId } });
      await tx.folder.updateMany({
        where: {
          userId,
          order: { gt: folder.order },
        },
        data: { order: { decrement: 1 } },
      });
    });

    logger.info({ userId, folderId }, "Folder deleted successfully");
    logger.debug({ elapsedMs: Date.now() - startTime }, "DELETE folder execution time");
    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error) {
    logger.error({ error }, "Error deleting folder");
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
