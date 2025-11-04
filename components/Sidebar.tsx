"use client";

import { useNotes } from "@/context/notesContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { ExpandedSidebar } from "./ExpandedSidebar";
import CollapsedSidebar from "./CollapsedSidebar";
import ProfilePopover from "./ProfilePopover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import Image from "next/image";

export const Sidebar = () => {
  const router = useRouter();
  const isMobile = useIsMobile(); 
  const { folders, quickNotes, setFolders, setQuickNotes } = useNotes();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleNewNote = (color?: string, folderId?: number) => {
    setShowColorPicker(false);
    setActiveMenu("");
    const params = new URLSearchParams();
    if (color) params.set("color", color);
    if (folderId) params.set("folderId", String(folderId));
    router.push(`/dashboard/new${params.toString() ? `?${params}` : ""}`);
    if (isMobile) setIsOpen(false);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const totalNotes =
    quickNotes.length +
    folders?.reduce((sum, f) => sum + (f.notes?.length || 0), 0);

  // Mobile Navbar
  if (isMobile) {
    return (
      <>
        <nav className="absolute top-0 left-0 right-0 z-40 bg-slate-50 dark:bg-primary-foreground border-b border-gray-200 dark:border-zinc-800 px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-accent/40 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-800 dark:text-gray-500" />
            </button>

            <header
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer flex gap-x-2 items-center"
            >
              <Image width={28} height={28} src="/favicon.jpg" alt="logo" />
              <h3
                style={{ fontFamily: "var(--font-playfair)" }}
                className="text-rose-900 dark:text-rose-600 font-semibold text-lg"
              >
                Orris
              </h3>
            </header>
          </div>
          <ProfilePopover sidebarCollapsed={true} isInNavbar={true} />
        </nav>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <aside
          className={`sidebar-container fixed inset-y-0 left-0 w-66 bg-slate-50 dark:bg-primary-foreground border-r border-gray-200 dark:border-zinc-800 z-50 flex flex-col transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarHeader
            sidebarCollapsed={false}
            isOpen={isOpen}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-3 space-y-6">
              <ExpandedSidebar
                showColorPicker={showColorPicker}
                setShowColorPicker={setShowColorPicker}
                handleNewNote={handleNewNote}
                quickNotes={quickNotes}
                folders={folders}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                setFolders={setFolders}
                setQuickNotes={setQuickNotes}
              />
            </div>
          </div>

          <div className="flex-shrink-0 p-4 border-t border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalNotes} Notes</span>
              <span>{folders.length} Folders</span>
            </div>
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside
      style={{ willChange: 'width' }}
      className={`sidebar-container bg-slate-50 dark:bg-primary-foreground dark:border-zinc-800 border-r border-gray-200 flex flex-col h-screen relative z-50 flex-shrink-0 transition-[width] duration-500 ${
        sidebarCollapsed ? "w-16" : "w-66"
      }`}
    >
      <div className="flex-shrink-0">
        <SidebarHeader
          sidebarCollapsed={sidebarCollapsed}
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {!sidebarCollapsed && 
          <div className="p-3 space-y-6 animate-in fade-in duration-700">
            <ExpandedSidebar
              showColorPicker={showColorPicker}
              setShowColorPicker={setShowColorPicker}
              handleNewNote={handleNewNote}
              quickNotes={quickNotes}
              folders={folders}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              setFolders={setFolders}
              setQuickNotes={setQuickNotes}
            />
          </div>
        } 
        
        {sidebarCollapsed &&
          <div className="p-3 animate-in fade-in duration-700">
            <CollapsedSidebar
              showColorPicker={showColorPicker}
              setShowColorPicker={setShowColorPicker}
              handleNewNote={handleNewNote}
            />
          </div>
        }
      </div>

      <div className="flex-shrink-0">
        <ProfilePopover sidebarCollapsed={sidebarCollapsed} />
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Notes: {totalNotes}</span>
              <span>{folders.length} Folders</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};