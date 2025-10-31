import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import logger from "./logger";
import { Folder, Note } from "@/context/notesContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function updateOrder(
  type: "folder" | "note",
  item: {note?: Note, folder?: Folder, id: number; order: number; folderId?: number | null }
) {
  try {
    logger.info(`Reordering ${type + item.id} with order: ${item.order}`)
        const body =
      type === "folder"
        ? {
            name: item.folder?.name,
            order: item.order,
          }
        : {
            content: item.note?.content,
            color: item.note?.color,
            order: item.order,
            imageURLs: item.note?.imageURLs,
            folderId: item.folderId ?? null,
            isPinned: item.note?.isPinned,
            isArchived: item.note?.isArchived,
            isFavorite: item.note?.isFavorite,
            tagNames: item.note?.tags?.map((t) => t.name),
          }

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/${type}s/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(`Failed to update ${type} order:`, error);
  }
}
