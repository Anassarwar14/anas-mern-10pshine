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

export function lightenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}