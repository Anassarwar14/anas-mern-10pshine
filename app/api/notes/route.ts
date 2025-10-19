import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismaDB';
import { tiptapToText, extractTitle, isValidTiptapContent, getEmptyContent } from '@/lib/tiptap-utils';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    const notes = await prismadb.note.findMany({
      where: {
        userId,
        isArchived: false,
        ...(folderId === "null" ? { folderId: null }
          : folderId ? { folderId: parseInt(folderId) } : {}),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { plainText: { contains: search, mode: "insensitive" } },
            {
              noteTags: {
                some: {
                  tag: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        }),
      },
      orderBy: [
        { order: "asc" },
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        content: true,
        plainText: true,
        color: true,
        order: true,
        folderId: true,
        isPinned: true,
        isFavorite: true,
        imageURLs: true,
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

    const formattedNotes = notes.map((note) => ({
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
    }));

    return NextResponse.json(formattedNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const { folderId, color, content, imageURLs, tagNames } = await req.json();

    const noteContent = content && isValidTiptapContent(content) ? content : getEmptyContent();
    
    const title = extractTitle(noteContent);
    const plainText = tiptapToText(noteContent);

    let connectTags: {tagId: number}[] = [];
    if (Array.isArray(tagNames) && tagNames.length > 0) {
      connectTags = await Promise.all(
        tagNames.map(async (name: string) => {
          const tag = await prismadb.tag.upsert({
            where: { name },
            update: {},
            create: { name, userId },
          });
          return { tagId: tag.id };
        })
      );
    }

    const lastNote = await prismadb.note.findFirst({
      where: { userId, folderId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastNote?.order ?? 0) + 1;

    const note = await prismadb.note.create({
      data: {
        userId,
        folderId: folderId || null,
        title,
        content: noteContent,
        plainText,
        color: color || "#FFE6A7",
        order: nextOrder ?? 0,
        imageURLs: imageURLs || [],
        noteTags: { create: connectTags },
      },
      include: {
        noteTags: {
          select: { tag: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
    });
  } catch (error) {
    console.error("Error creating note:", error);
    const message = error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to create note";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}