"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, ChevronRight, Home, Folder, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NoteCard from "@/components/noteCard"
import EmptyState from "@/components/emptyState"
import { useRouter, useSearchParams } from "next/navigation"
import { Note, useNotes } from "@/context/notesContext"  // ✅ shared state
import { SearchIcon } from "@/components/ui/SearchIcon"

export default function Dashboard() {
  console.log("mounted dashboard");
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFolderId = searchParams.get("folderId")

  const { folders, setFolders, quickNotes, setQuickNotes } = useNotes()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  // const [loading, setLoading] = useState(false)

  // ✅ Combine notes: quick + folder
  const allNotes = useMemo(() => {
    let combined = [...quickNotes]
    folders.forEach(f => {
      if (Array.isArray(f.notes)) combined.push(...f.notes)
    })
    return combined
  }, [folders, quickNotes])

  const filteredNotes = useMemo(() => {
    if (currentFolderId) {
      const folder = folders.find(f => f.id === Number(currentFolderId))
      return folder?.notes || []
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return allNotes.filter(n => {
        const titleMatch = n.title?.toLowerCase().includes(q)
        const contentMatch = n.plainText?.toLowerCase().includes(q)
        const tagMatch = n.tags?.some(t => t.name.toLowerCase().includes(q))
        const folderMatch = folders.some(f =>
          f.name.toLowerCase().includes(q) &&
          f.notes?.some(fn => fn.id === n.id)
        )


        return titleMatch || contentMatch || tagMatch || folderMatch
      })
    }

    return quickNotes
  }, [folders, allNotes, currentFolderId, searchQuery, quickNotes])

  const currentFolder = useMemo(
    () => folders.find(f => f.id === Number(currentFolderId)) ?? null,
    [folders, currentFolderId]
  )

  const handleUpdateNote = async (note: Note, updates: Partial<Note>) => {
    try {
      const updated = { ...note, ...updates }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: note.content,
          color: note.color,
          order: updated.order,
          imageURLs: note.imageURLs,
          folderId: updated.folderId,
          isPinned: updated.isPinned,
          isArchived: updated.isArchived,
          isFavorite: updated.isFavorite,
          tagNames: note.tags?.map(t => t.name),
        }),
      })
      if (!res.ok) throw new Error("Failed to update note")

      if (updated.folderId) {
        setFolders(prev =>
          prev.map(f =>
            f.id === updated.folderId
              ? {
                  ...f,
                  notes: f.notes?.map(n =>
                    n.id === note.id ? updated : n
                  ),
                }
              : f
          )
        )
      } else {
        setQuickNotes(prev =>
          prev.map(n => (n.id === note.id ? updated : n))
        )
      }
    } catch (err) {
      console.error("Error updating note:", err)
    }
  }

  const handleDeleteNote = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notes/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete note")

      setFolders(prev =>
        prev.map(f => ({
          ...f,
          notes: f.notes?.filter(n => n.id !== id),
        }))
      )
      setQuickNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error("Error deleting note:", err)
    }
  }


  const pinnedNotes = filteredNotes.filter(n => n.isPinned)
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned)

  return (
    <div className="max-w-full w-full min-h-screen bg-gradient-to-br from-background/30 via-background/30 to-secondary/5">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">
                {currentFolder ? currentFolder.name : "My Notes"}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              ({filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"})
            </p>
          </div>

          {currentFolder && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="link"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer flex items-center gap-1"
              >
                <Home className="h-4 w-4" /> Home
              </Button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">
                {currentFolder.name}
              </span>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            {/* <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" isSearch={isSearching} />
            <Input
              onFocus={() => setIsSearching(true)}
              onBlur={() => setIsSearching(false)}
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 h-10 bg-secondary/10 border-border/50 focus:border-primary/50 focus:bg-secondary/20 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="overflow-y-auto mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Folder Section (only show on home view) */}
        {!currentFolder && folders.length > 0 && (
          <section>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() =>
                    router.push(`/dashboard?folderId=${folder.id}`)
                  }
                  className="cursor-pointer group flex items-center justify-between p-4 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all border border-border/50 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {folder.name}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Notes Section */}
        {filteredNotes.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div className="space-y-8">
            {pinnedNotes.length > 0 && (
              <section>
                <h2 className="text-xs text-muted-foreground mb-3">Pinned</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onToggleFavorite={() =>
                        handleUpdateNote(note, { isFavorite: !note.isFavorite })
                      }
                      onTogglePin={() =>
                        handleUpdateNote(note, { isPinned: !note.isPinned })
                      }
                      onDelete={() => handleDeleteNote(note.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {unpinnedNotes.length > 0 && (
              <section>
                <h2 className="text-xs text-muted-foreground mb-3">All Notes</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onToggleFavorite={() =>
                        handleUpdateNote(note, { isFavorite: !note.isFavorite })
                      }
                      onTogglePin={() =>
                        handleUpdateNote(note, { isPinned: !note.isPinned })
                      }
                      onDelete={() => handleDeleteNote(note.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
