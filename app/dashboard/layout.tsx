import { cookies } from "next/headers";
import { NotesProvider } from "@/context/notesContext";
import { Sidebar } from "@/components/Sidebar";
import DotGrid from "@/components/DotGrid";
import ShortcutHandler from "@/components/ShortcutHandler";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const [foldersRes, notesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/folders`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notes?folderId=null`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    }),
  ]);

  const [folders, notes] = await Promise.all([foldersRes.json(), notesRes.json()]);

  return (
    <NotesProvider initialFolders={folders} initialNotes={notes}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <ShortcutHandler />
        <div
          className="bg-primary-foreground fixed inset-0 pointer-events-none -z-10"
        >
          <DotGrid
            dotSize={3}
            gap={15}
            baseColor="#E2E2E8"
            activeColor="#ec003f"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </NotesProvider>
  );
}
