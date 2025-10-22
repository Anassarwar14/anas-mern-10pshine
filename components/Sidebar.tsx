"use client"

import { useEffect, useRef, useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { ExpandedSidebar } from "./ExpandedSidebar";
import CollapsedSidebar from "./CollapsedSidebar";
import { useRouter } from "next/navigation";
import LogOutButton from "./LogOutButton";

export const Sidebar = () => {
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [myNotesExpanded, setMyNotesExpanded] = useState<boolean>(true);
  const [foldersExpanded, setFoldersExpanded] = useState<boolean>(true);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const colors = [
    { name: "Blush Pink", value: "#F7A8B8" },
    { name: "Soft Mint", value: "#A8E6CF" },
    { name: "Sky Blue", value: "#A9DEF9" },
    { name: "Lavender", value: "#CABBE9" },
    { name: "Golden Mist", value: "#FFE6A7" },
    { name: "Coral Sunset", value: "#FF9B85" },
  ];

  const [folders, setFolders] = useState([
    {
      id: 1,
      name: 'Work Projects',
      notes: [
        { id: 1, title: 'Meeting Notes', color: 'bg-yellow-200' },
        { id: 2, title: 'Project Ideas', color: 'bg-blue-200' }
      ]
    },
    {
      id: 2,
      name: 'Personal',
      notes: [
        { id: 3, title: 'Shopping List', color: 'bg-green-200' },
        { id: 4, title: 'Book Ideas', color: 'bg-pink-200' }
      ]
    },
    {
      id: 3,
      name: 'Study',
      notes: [
        { id: 5, title: 'Math Notes', color: 'bg-purple-200' }
      ]
    }
  ]);

  const [quickNotes, setQuickNotes] = useState([
    { id: 6, title: 'Quick Thoughts', color: 'bg-orange-200' },
    { id: 7, title: 'Daily Journal', color: 'bg-yellow-200' }
  ]);


  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // only close if click happened outside the menu
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setActiveMenu(null);
    }
  };

  if (activeMenu) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [activeMenu]);


  const handleNewNote = (color?: string, folderId?: number) => {
    setShowColorPicker(false);
    const params = new URLSearchParams();
    if (color) params.set("color", color);
    if (folderId) params.set("folderId", String(folderId));
    router.push(`/dashboard/new${params.toString() ? `?${params}` : ""}`);
  };

  const toggleMenu = (id: string) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const toggleMyNotes = () => {
    setMyNotesExpanded(prev => !prev);
  };

  const toggleFoldersSection = () => {
    setFoldersExpanded(prev => !prev);
  };

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleDragStart = (e: React.DragEvent, item: any, type: string, sourceFolderId?: number) => {
    const draggedData = { ...item, type, sourceFolderId };
    setDraggedItem(draggedData);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: number | null, targetType: string, targetItemId?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;

    // Handle folder reordering
    if (draggedItem.type === 'folder' && targetType === 'folder' && targetFolderId !== null) {
      if (draggedItem.id === targetFolderId) {
        setDraggedItem(null);
        return;
      }

      setFolders(prev => {
        const draggedIndex = prev.findIndex(f => f.id === draggedItem.id);
        const targetIndex = prev.findIndex(f => f.id === targetFolderId);
        
        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const newFolders = [...prev];
        const [removed] = newFolders.splice(draggedIndex, 1);
        newFolders.splice(targetIndex, 0, removed);
        
        return newFolders;
      });

      setDraggedItem(null);
      return;
    }

    // Handle note reordering within same location
    if ((draggedItem.type === 'quick' || draggedItem.type === 'note') && targetItemId) {
      // Reordering within quick notes
      if (draggedItem.type === 'quick' && (targetType === 'quick' || targetFolderId === null)) {
        setQuickNotes(prev => {
          const draggedIndex = prev.findIndex(n => n.id === draggedItem.id);
          const targetIndex = prev.findIndex(n => n.id === targetItemId);
          
          if (draggedIndex === -1 || targetIndex === -1) return prev;

          const newNotes = [...prev];
          const [removed] = newNotes.splice(draggedIndex, 1);
          newNotes.splice(targetIndex, 0, removed);
          
          return newNotes;
        });

        setDraggedItem(null);
        return;
      }

      // Reordering within same folder
      if (draggedItem.type === 'note' && draggedItem.sourceFolderId === targetFolderId && targetType === 'note') {
        setFolders(prev => prev.map(folder => {
          if (folder.id === targetFolderId) {
            const draggedIndex = folder.notes.findIndex(n => n.id === draggedItem.id);
            const targetIndex = folder.notes.findIndex(n => n.id === targetItemId);
            
            if (draggedIndex === -1 || targetIndex === -1) return folder;

            const newNotes = [...folder.notes];
            const [removed] = newNotes.splice(draggedIndex, 1);
            newNotes.splice(targetIndex, 0, removed);
            
            return { ...folder, notes: newNotes };
          }
          return folder;
        }));

        setDraggedItem(null);
        return;
      }
    }

    // Handle note drops (moving between different locations)
    if (draggedItem.type === 'quick' || draggedItem.type === 'note') {
      const note = draggedItem;

      // Check if moving to different location
      const movingToDifferentLocation = 
        (draggedItem.type === 'quick' && targetType !== 'quick' && targetFolderId !== null) ||
        (draggedItem.type === 'note' && draggedItem.sourceFolderId !== targetFolderId);

      if (!movingToDifferentLocation && !targetItemId) {
        setDraggedItem(null);
        return;
      }

      // Remove note from source
      if (draggedItem.type === 'quick') {
        setQuickNotes(prev => prev.filter(n => n.id !== note.id));
      } else if (draggedItem.sourceFolderId) {
        setFolders(prev => prev.map(f => 
          f.id === draggedItem.sourceFolderId 
            ? { ...f, notes: f.notes.filter(n => n.id !== note.id) }
            : f
        ));
      }

      // Add note to target
      if (targetType === 'quick' || targetFolderId === null) {
        setQuickNotes(prev => [...prev, { id: note.id, title: note.title, color: note.color }]);
      } else if (targetType === 'folder' || targetType === 'note') {
        setFolders(prev => prev.map(f => 
          f.id === targetFolderId 
            ? { ...f, notes: [...f.notes, { id: note.id, title: note.title, color: note.color }] }
            : f
        ));
      }
    }

    setDraggedItem(null);
  };
  
  const totalNotes = quickNotes.length + folders.reduce((sum, f) => sum + f.notes.length, 0);

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-66'} bg-slate-50 border-r border-gray-200 transition-all duration-200 flex flex-col relative`}>
      <div className="absolute top-10 right-4 w-16 h-16 border-2 border-rose-900/20 rounded-full opacity-30"></div>
      <div className="absolute top-40 left-3 w-10 h-10 border-2 border-rose-900/5 rotate-45"></div>
      <div className="absolute bottom-20 right-6 w-20 h-20 border-2 border-slate-400/10 rounded-lg rotate-12"></div>
      <div className="absolute top-2/5 right-4 w-8 h-8 bg-rose-400/5 rounded-full"></div>
      
      <SidebarHeader
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className={`space-y-6 relative z-10 opacity-0 transition ease-in-out duration-700 ${!sidebarCollapsed ? 'opacity-100 flex-1 p-3' : 'p-0'}`}>
        {!sidebarCollapsed && (
          <ExpandedSidebar
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            handleNewNote={handleNewNote}
            quickNotes={quickNotes}
            folders={folders}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            activeMenu={activeMenu}
            toggleMenu={toggleMenu}
            menuRef={menuRef}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedItem={draggedItem}
            myNotesExpanded={myNotesExpanded}
            foldersExpanded={foldersExpanded}
            toggleMyNotes={toggleMyNotes}
            toggleFoldersSection={toggleFoldersSection}
          />
        )}
      </div>
      
      <div className={`flex-1 p-3 relative z-10 opacity-0 transition ease-in-out duration-700 ${sidebarCollapsed && 'opacity-100'}`}>
        {sidebarCollapsed && (    
          <CollapsedSidebar
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            handleNewNote={handleNewNote}
          />
        )}
      </div>

      {!sidebarCollapsed && (
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm relative z-10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Notes: {totalNotes}</span>
            <span>{folders.length} Folders</span>
          </div>
        </div>
      )}

      <LogOutButton />
    </div>
  );
};