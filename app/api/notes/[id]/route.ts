import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismaDB";
import { verifyJwt } from "@/lib/jwt";
import { extractTitle, getEmptyContent, isValidTiptapContent, tiptapToText } from "@/lib/tiptapUtils";
import logger from "@/lib/logger";
import isEqual from "lodash/isEqual";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;
    if (!token) {
      logger.warn("Unauthorized request to /api/notes/[id]");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;
    const noteId = parseInt(id);

    logger.info({ userId, noteId }, "Fetching single note");

    const note = await prismadb.note.findFirst({
      where: {
        id: noteId,
        userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        color: true,
        folderId: true,
        isPinned: true,
        isFavorite: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        noteTags: {
          select: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!note) {
      logger.warn({ userId, noteId }, "Note not found");
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const formattedNote = {
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
    };

    logger.info({ userId, noteId }, "Fetched note successfully");

    return NextResponse.json(formattedNote);
  } catch (error) {
    logger.error({ error }, "Error fetching single note");
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(token);
    const userId = decoded.userId;
    const noteId = parseInt(id);

    if (isNaN(noteId)) {
      logger.warn({ userId, noteId }, "Invalid note ID received");
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      content,
      color,
      imageURLs,
      folderId,
      order: requestedOrder,
      isPinned,
      isArchived,
      isFavorite,
      tagNames,
      userTitle
    } = body;
    
    const existingNote = await prismadb.note.findUnique({
      where: { id: noteId },
      include: { noteTags: { select: { tag: { select: { name: true } } } } }
    });
    
    if (!existingNote || existingNote.userId !== userId) {
      logger.warn({ userId, noteId }, "Note not found or unauthorized access");
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
    }

    const existingTagNames = existingNote.noteTags.map(nt => nt.tag.name);
    const noChanges =
      isEqual(existingNote.content, content) &&
      existingNote.color === color &&
      isEqual(existingNote.imageURLs, imageURLs) &&
      existingNote.folderId === folderId &&
      existingNote.order === requestedOrder &&
      existingNote.isPinned === isPinned &&
      existingNote.isArchived === isArchived &&
      existingNote.isFavorite === isFavorite &&
      isEqual(existingTagNames, tagNames);

    if (noChanges) {
      logger.info({ userId, noteId }, "No changes detected — skipping update");
      return NextResponse.json({ message: "No changes detected" });
    }
    else{
      logger.info(
        {
          userId,
          noteId,
          differences: {
            contentEqual: isEqual(existingNote.content, content),
            colorEqual: existingNote.color === color,
            imageURLsEqual: isEqual(existingNote.imageURLs, imageURLs),
            folderIdEqual: existingNote.folderId === folderId,
            orderEqual: existingNote.order === requestedOrder,
            isPinnedEqual: existingNote.isPinned === isPinned,
            isArchivedEqual: existingNote.isArchived === isArchived,
            isFavoriteEqual: existingNote.isFavorite === isFavorite,
            isTagEqual: isEqual(existingTagNames, tagNames)
          },
        },
        "Field comparison results"
      );
    }
    
    logger.info({ userId, noteId, folderId }, "Starting note update");

    const noteContent = content && isValidTiptapContent(content) ? content : getEmptyContent();
    const plainText = tiptapToText(noteContent);

    let title = "Untitled";
    if(!userTitle){
      
      const oldExtractedTitle = extractTitle(existingNote.content);
      const newExtractedTitle = extractTitle(noteContent);
      const shouldUpdateTitle = (existingNote.title === oldExtractedTitle);
      if (shouldUpdateTitle) console.log("Changing title from ", oldExtractedTitle," to ", newExtractedTitle);
      title = shouldUpdateTitle ? newExtractedTitle : existingNote.title
    }
    else{
      title = userTitle ? userTitle : extractTitle(noteContent);
    }

    let connectTags: { tagId: number }[] = [];
    if (Array.isArray(tagNames)) {
      connectTags = await Promise.all(
        tagNames.map(async (name: string) => {
          let tag = await prismadb.tag.findFirst({
            where: { name, userId },
          });

          if (!tag) {
            tag = await prismadb.tag.create({
              data: { name, userId },
            });
          }

          return { tagId: tag.id };
        })
      );
    }

    const currentNoteTags = await prismadb.noteTag.findMany({
      where: { noteId },
      select: { tagId: true },
    });

    const currentTagIds = currentNoteTags.map((t) => t.tagId);
    const newTagIds = connectTags.map((t) => t.tagId);
    const tagsToAdd = newTagIds.filter((id) => !currentTagIds.includes(id));
    const tagsToRemove = currentTagIds.filter((id) => !newTagIds.includes(id));

    const baseData: any = {
      title: title?.trim() ?? "Untitled",
      content: noteContent,
      plainText: plainText ?? "",
      color: color ?? "#FFE6A7",
      imageURLs: Array.isArray(imageURLs) ? imageURLs : [],
      folderId: folderId ?? null,
      isPinned: isPinned ?? false,
      isArchived: isArchived ?? false,
      isFavorite: isFavorite ?? false,
      noteTags: {},
    };

    if (Array.isArray(tagNames)) {
      baseData.noteTags = {
        ...(tagsToAdd.length > 0
          ? {
              create: tagsToAdd.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : {}),
        ...(tagsToRemove.length > 0
          ? {
              deleteMany: tagsToRemove.map((tagId) => ({ tagId })),
            }
          : {}),
      };
    } else {
      baseData.noteTags = { deleteMany: {} };
    }

    const isFolderChanged = folderId !== existingNote.folderId;

    const updatedNote = await prismadb.$transaction(async (tx) => {
      if (isFolderChanged) {
        logger.info({ userId, noteId, from: existingNote.folderId, to: folderId }, "Moving note between folders");

        await tx.note.updateMany({
          where: {
            userId,
            folderId: existingNote.folderId,
            order: { gt: existingNote.order },
          },
          data: { order: { decrement: 1 } },
        });

        const lastInNewFolder = await tx.note.findFirst({
          where: { userId, folderId: folderId ?? null },
          orderBy: { order: "desc" },
          select: { order: true },
        });

        const newOrder = (lastInNewFolder?.order ?? 0) + 1;

        const moved = await tx.note.update({
          where: { id: noteId },
          data: { ...baseData, order: newOrder },
          include: { noteTags: { select: { tag: { select: { id: true, name: true } } } } },
        });

        return { ...moved, tags: moved.noteTags.map((nt) => nt.tag) };
      }

      const hasOrderUpdate = typeof requestedOrder === "number" && requestedOrder !== existingNote.order;
      if (hasOrderUpdate) {
        logger.info({ userId, noteId, requestedOrder }, "Reordering note");

        const currentOrder = existingNote.order;
        let newOrder = Math.max(1, Math.floor(requestedOrder));

        const maxRes = await tx.note.findFirst({
          where: { userId, folderId: existingNote.folderId },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        const maxOrder = maxRes?.order ?? 0;
        newOrder = Math.min(newOrder, maxOrder);

        const direction = newOrder > currentOrder ? "down" : "up";

        if (direction === "down") {
          await tx.note.updateMany({
            where: { userId, folderId: existingNote.folderId, order: { gt: currentOrder, lte: newOrder } },
            data: { order: { decrement: 1 } },
          });
        } else if (direction === "up") {
          await tx.note.updateMany({
            where: { userId, folderId: existingNote.folderId, order: { gte: newOrder, lt: currentOrder } },
            data: { order: { increment: 1 } },
          });
        }

        const reordered = await tx.note.update({
          where: { id: noteId },
          data: { ...baseData, order: newOrder },
          include: { noteTags: { select: { tag: { select: { id: true, name: true } } } } },
        });

        return { ...reordered, tags: reordered.noteTags.map((nt) => nt.tag) };
      }

      const updated = await tx.note.update({
        where: { id: noteId },
        data: baseData,
        include: { noteTags: { select: { tag: { select: { id: true, name: true } } } } },
      });

      return { ...updated, tags: updated.noteTags.map((nt) => nt.tag) };
    });

    logger.info({ userId, noteId, duration: `${Date.now() - startTime}ms` }, "Note updated successfully");
    return NextResponse.json(updatedNote);
  } catch (err) {
    logger.error({ err }, "Error updating note");
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}



export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(token);
    const userId = decoded.userId;
    const noteId = parseInt(id);

    if (isNaN(noteId))
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });

    logger.info({ userId, noteId }, "Deleting note");

    const note = await prismadb.note.findUnique({ where: { id: noteId, userId } });
    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    await prismadb.$transaction(async (tx) => {
      await tx.note.delete({ where: { id: noteId } });

      await tx.note.updateMany({
        where: { userId, folderId: note.folderId, order: { gt: note.order } },
        data: { order: { decrement: 1 } },
      });
    });

    logger.info({ userId, noteId }, "Note deleted successfully");
    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    logger.error({ error }, "Error deleting note");
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}