"use client"

import { useState } from "react"
import { Pin, Heart, Trash2, Tag, Calendar, PinOff } from "lucide-react"
import { Card } from "@/components/tiptap-ui-primitive/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNowStrict } from "date-fns"
import { useRouter } from "next/navigation"

interface NoteCardProps {
  note: {
    id: number
    title: string
    plainText: string
    color: string
    isPinned: boolean
    isFavorite: boolean
    tags: Array<{ id: number; name: string }>
    updatedAt: string
  }
  onToggleFavorite: (id: number) => void
  onTogglePin: (id: number) => void
  onDelete: (id: number) => void
}

export default function NoteCard({ note, onToggleFavorite, onTogglePin, onDelete }: NoteCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const truncateText = (text: string, lines = 3) => {
    if (!text) return ""
    let content = text.trim()
    const titleNormalized = note.title.trim().toLowerCase()
    const contentNormalized = content.toLowerCase()

    if (contentNormalized.startsWith(titleNormalized)) {
      content = content.slice(note.title.length).trimStart()
    }
    
    const lineArray = content.split("\n").slice(0, lines)
    return lineArray.join("\n").substring(0, 150) + (content.length > 150 ? "..." : "")
  }

  if (!note)
    return null;

  return (
    <Card
      onClick={() => router.push(`/dashboard/${note.id}`)}
      className="md:min-h-56 group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-white/20 backdrop-blur-sm"
      style={{
        backgroundColor: note.color
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full relative pt-4 px-4 pb-2 h-full flex flex-col gap-y-3 md:gap-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 font-semibold text-base text-gray-950 line-clamp-2 leading-snug tracking-tight">
            {note.title}
          </h3>
          {note.isPinned && (
            <div className="relative group/pin flex-shrink-0">
                <div className="p-1.5 rounded-lg bg-white/40 backdrop-blur-sm transition-opacity group-hover/pin:opacity-0">
                    <Pin className="h-4 w-4 text-primary/80 fill-amber-400 rotate-30" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pin:opacity-100 transition-opacity">
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        className="p-0 rounded-lg hover:bg-white/40 backdrop-blur-sm transition-all cursor-pointer"
                        onClick={(e) => {
                        e.stopPropagation()
                        onTogglePin(note.id)
                        }}
                    >
                        <PinOff className="h-4 w-4 text-gray-700 hover:text-primary transition-colors rotate-12" />
                    </Button>
                </div>
            </div>
            )}
        </div>

        <p className="flex-1 text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-4 break-words">{truncateText(note.plainText)}</p>

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/30 backdrop-blur-sm px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-gray-800 border border-white/40 transition-all hover:bg-white/40"
              >
                <Tag className="h-3 w-3" />
                {tag.name}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-gray-700">
                +{note.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-700 font-medium">
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            {note.updatedAt && formatDistanceToNowStrict(new Date(note.updatedAt), { addSuffix: true })}
          </span>

          <div className="flex gap-0.5 transition-all duration-200">
            <Button
              size="sm"
              variant="ghost"
              className={`${note.isFavorite || isHovered ? "opacity-100" : "opacity-60 sm:opacity-0"} cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-white/30 backdrop-blur-sm transition-all hover:scale-110 duration-200`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(note.id)
              }}
            >
              <Heart
                className={`h-4 w-4 transition-all ${
                  note.isFavorite ? "fill-red-500 text-red-500 opacity-100" : "text-gray-700 hover:text-red-500"
                }`}
              />
            </Button>
            {!note.isPinned && 
                <Button
                    size="sm"
                    variant="ghost"
                    className={`${isHovered ? "opacity-100" : "opacity-60 sm:opacity-0"} cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-white/30 backdrop-blur-sm transition-all hover:scale-110 duration-200`}
                    onClick={(e) => {
                        e.stopPropagation()
                        onTogglePin(note.id)
                    }}
                    >
                    <Pin className="h-4 w-4 text-gray-700 hover:text-primary transition-colors" />
                </Button>
            }
            <Button
              size="sm"
              variant="ghost"
              className={`${isHovered ? "opacity-100" : "opacity-60 sm:opacity-0"} cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-white/30 backdrop-blur-sm transition-all hover:scale-110 duration-200`}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(note.id)
              }}
            >
              <Trash2 className="h-4 w-4 text-gray-700 hover:text-red-500 transition-colors" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
