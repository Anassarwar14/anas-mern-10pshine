import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { cookies } from "next/headers"


interface NotePageProps {
  params: Promise<{ noteId: string }>  
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}

export default async function NotePage({ params, searchParams }: NotePageProps) {
  const cookieStore = await cookies()
  const token =  cookieStore.get("token")?.value
  const { noteId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const folderIdParam = resolvedSearchParams?.folderId;
  const colorParam = resolvedSearchParams?.color;

  // "new" case
  if (noteId === "new") {
    return (
      <SimpleEditor 
          mode="create"
          folderId={folderIdParam ? Number(folderIdParam) : null}
          initialColor={colorParam ? String(colorParam) : undefined}
        />
    )
  }

  //existing
  // const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notes/${noteId}`)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notes/${noteId}`, {
    method: 'GET',
    headers: {
      Cookie: `token=${token};`
    },
    cache: "no-store",
  }); 

  if (!res.ok) {
    return <div>Note not found {(await res.json()).message}</div>
  }

  const note = await res.json()

  const existingTagNames = note.noteTags?.map((nt:any) => nt.tag.name) || [];
  return (
      <SimpleEditor 
        mode="edit"
        noteId={note.id}
        folderId={note.folderId}
        title={note.title}
        initialContent={note.content}
        initialColor={note.color}
        initialTags={existingTagNames}
        initialPinned={note.isPinned}
        initialFavorite={note.isFavorite}
        initialArchive={note.isArchived}
        initialOrder={note.order}
      />
  )
}
