"use client";

import { useNotes } from "@/context/notesContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { ExpandedSidebar } from "./ExpandedSidebar";
import CollapsedSidebar from "./CollapsedSidebar";
import LogOutButton from "./LogOutButton";
import ProfilePopover from "./ProfilePopover";

export const Sidebar = () => {
  const { folders, quickNotes, setFolders, setQuickNotes } = useNotes();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleNewNote = (color?: string, folderId?: number) => {
    setShowColorPicker(false);
    setActiveMenu("");
    const params = new URLSearchParams();
    if (color) params.set("color", color);
    if (folderId) params.set("folderId", String(folderId));
    router.push(`/dashboard/new${params.toString() ? `?${params}` : ""}`);
  };

  const totalNotes =
    quickNotes.length +
    folders?.reduce((sum, f) => sum + (f.notes?.length || 0), 0);

  return (
    <div
      className={`${
        sidebarCollapsed ? "w-16" : "min-w-66 w-66"
      } bg-slate-50 border-r border-gray-200 transition-all duration-200 flex flex-col relative`}
    >
      <SidebarHeader
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {!sidebarCollapsed && (
        <div className="flex-1 p-3 space-y-6 relative z-10 opacity-100 transition ease-in-out duration-700">
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
      )}

      {sidebarCollapsed && (
        <div className="flex-1 p-3 relative z-10 opacity-100">
          <CollapsedSidebar
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            handleNewNote={handleNewNote}
          />
        </div>
      )}

   <ProfilePopover sidebarCollapsed={sidebarCollapsed} />
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm relative">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Notes: {totalNotes}</span>
            <span>{folders.length} Folders</span>
          </div>
        </div>
      )}

      {/* <LogOutButton /> */}
    </div>
  );
};
