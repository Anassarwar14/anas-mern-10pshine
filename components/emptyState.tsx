"use client"

import { FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface EmptyStateProps {
  searchQuery: string
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-secondary/50 p-4 mb-4 animate-pulse">
        {searchQuery ? (
          <Search className="h-8 w-8 text-muted-foreground" />
        ) : (
          <FileText className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{searchQuery ? "No notes found" : "No notes yet"}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {searchQuery
          ? `We couldn't find any notes matching "${searchQuery}". Try a different search term.`
          : 'Create your first note to get started. Click the "New Note" button above.'}
      </p>
      {!searchQuery && (
        <Button onClick={() => router.push("/dashboard/new")} className="gap-2 bg-primary hover:bg-primary/90">
          <FileText className="h-4 w-4" />
          Create First Note
        </Button>
      )}
    </div>
  )
}
