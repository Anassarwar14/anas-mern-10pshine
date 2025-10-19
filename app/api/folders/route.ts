import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismaDB";
import { verifyJwt } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const folders = await prismadb.folder.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

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

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
