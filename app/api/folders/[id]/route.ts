import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismaDB";
import { verifyJwt } from "@/lib/jwt";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const folderId = parseInt(params.id);
    if (Number.isNaN(folderId)) {
      return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
    }

    const { name, order: requestedOrder } = await req.json();

    const existingFolder = await prismadb.folder.findUnique({
      where: { id: folderId },
      select: { id: true, userId: true, order: true },
    });

    if (!existingFolder || existingFolder.userId !== userId) {
      return NextResponse.json({ error: "Folder not found or unauthorized" }, { status: 404 });
    }

    const hasOrderUpdate = typeof requestedOrder === "number";
    if (!hasOrderUpdate) {
      const updated = await prismadb.folder.update({
        where: { id: folderId, userId },
        data: { ...(name ? { name: name.trim() } : {}) },
      });
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
      return NextResponse.json(updated);
    }

    const updatedFolder = await prismadb.$transaction(async (tx) => {
      const direction = newOrder > currentOrder ? "down" : "up";
      if (direction === "down") {
        // move down: shift intervening folders up (decrement their order by 1)
        await tx.folder.updateMany({
          where: {
            userId,
            order: { gt: currentOrder, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        // move up: shift intervening folders down (increment their order by 1)
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

    return NextResponse.json(updatedFolder);
  } catch (err) {
    console.error("Error updating folder:", err);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const folderId = parseInt(params.id);
    if (isNaN(folderId)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
    }

    const folder = await prismadb.folder.findUnique({
      where: { id: folderId, userId },
    });

    if (!folder) {
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

    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
