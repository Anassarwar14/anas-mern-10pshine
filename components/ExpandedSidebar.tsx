import { ChevronDown, ChevronRight, Edit2, GripVertical, MoreVertical, Plus, Trash2 } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { FolderOpenIcon } from "./ui/FolderOpenIcon";
import { FolderIcon } from "./ui/FolderIcon";
import { useEffect, useRef, useState } from "react";
import { updateOrder } from "@/lib/utils";
import { Folder, Note } from "@/context/notesContext";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "./ConfirmModal";


interface ExpandedSidebarProps {
  showColorPicker: boolean 
  setShowColorPicker: React.Dispatch<React.SetStateAction<boolean>>
  handleNewNote: (color?: string, folderId?: number) => void;
  quickNotes: any[]
  folders: any[]
  setFolders: React.Dispatch<React.SetStateAction<any[]>>
  setQuickNotes: React.Dispatch<React.SetStateAction<any[]>>
  activeMenu: string | null
  setActiveMenu: React.Dispatch<React.SetStateAction<string | null>>
}



export const ExpandedSidebar = ({ 
  showColorPicker, 
  setShowColorPicker, 
  handleNewNote,
  quickNotes,
  folders,
  setFolders,
  setQuickNotes,
  activeMenu,
  setActiveMenu
}: ExpandedSidebarProps) => {

    const router = useRouter()
    const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});
    const [myNotesExpanded, setMyNotesExpanded] = useState<boolean>(true);
    const [foldersExpanded, setFoldersExpanded] = useState<boolean>(true);
    const [showConfirm, setShowConfirm] = useState(false)
    const [draggedItem, setDraggedItem] = useState<any>(null);
    const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [newFolderTempId, setNewFolderTempId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);


    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // only close if click happened outside the menu
        if (menuRef.current && 
            !menuRef.current.contains(event.target as Node) &&
            !buttonRef.current?.contains(event.target as Node)) {
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
  

 // --- CORE CRUD FUNCTIONS ---
  const handleCreateFolder = () => {
    const tempId = Date.now();
    const newFolder = {
      id: tempId,
      name: "",
      order: folders.length + 1,
      notes: [],
      isNew: true,
    };
    setFolders((prev) => [...prev, newFolder]);
    setEditingFolderId(tempId);
    setEditingName("");
    setNewFolderTempId(tempId);
  };

  const handleRenameFolder = (folderId: number, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingName(currentName);
  };

  const handleSaveFolderName = async (folderId: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      // if empty and was a new folder → remove it
      if (newFolderTempId === folderId) {
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        setNewFolderTempId(null);
      }
      setEditingFolderId(null);
      return;
    }

    if (newFolderTempId === folderId) {
      // new folder creation
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, name: trimmed, isNew: false } : f
        )
      );
      setNewFolderTempId(null);

      await fetch(`/api/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
    } else {
      // rename existing folder
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f))
      );
      setEditingFolderId(null)
      await fetch(`/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
    }

    setEditingFolderId(null);
  };



  const handleDeleteFolder = async (folderId: number) => {
    await fetch(`/api/folders/${folderId}`, {
      method: "DELETE",
    })
    setShowConfirm(false)
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  const handleDeleteNote = async (noteId: number, folderId?: number | null) => {
    if (folderId) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, notes: f.notes.filter((n: any) => n.id !== noteId) } : f
        )
      );
    } else {
      setQuickNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" })
  };

  const handleOpenNote = (noteId: number) =>{ setActiveMenu(null); router.push(`/dashboard/${noteId}`)};


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
  
    const handleDrop = (e: React.DragEvent, targetFolderId: number | null, targetType: string, targetItemId?: number | null) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!draggedItem) return;
  
      let newOrderValue: number | undefined;
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
          newOrderValue = newFolders[targetIndex].order;
          const [removed] = newFolders.splice(draggedIndex, 1);
          newFolders.splice(targetIndex, 0, removed);
          
          return newFolders;
        });
        
        if (newOrderValue !== undefined) {
          updateOrder("folder", { folder: draggedItem, id: draggedItem.id, order: newOrderValue });
        }
  
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
            newOrderValue = newNotes[targetIndex].order;
            const [removed] = newNotes.splice(draggedIndex, 1);
            newNotes.splice(targetIndex, 0, removed);
            
            
            return newNotes;
          });

          if (newOrderValue !== undefined) {
            updateOrder("note", {note: draggedItem, id: draggedItem.id, order: newOrderValue, folderId: null });
          }
  
          setDraggedItem(null);
          return;
        }
  
        // Reordering within same folder
        if (draggedItem.type === 'note' && draggedItem.sourceFolderId === targetFolderId && targetType === 'note') {
          setFolders(prev => prev.map(folder => {
            if (folder.id === targetFolderId) {
              const draggedIndex = folder.notes.findIndex((n:any) => n.id === draggedItem.id);
              const targetIndex = folder.notes.findIndex((n:any) => n.id === targetItemId);
              
              if (draggedIndex === -1 || targetIndex === -1) return folder;
  
              const newNotes = [...folder.notes];
              newOrderValue = newNotes[targetIndex].order;
              const [removed] = newNotes.splice(draggedIndex, 1);
              newNotes.splice(targetIndex, 0, removed);
              
              
              return { ...folder, notes: newNotes };
            }
            return folder;
          }));

          if (newOrderValue !== undefined) {
            updateOrder("note", {note: draggedItem, id: draggedItem.id, order: newOrderValue, folderId: targetFolderId });
          }
  
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
  
        updateOrder("note", {note: draggedItem, id: draggedItem.id, order: 0, folderId: targetFolderId });

        // Remove note from source
        if (draggedItem.type === 'quick') {
          setQuickNotes(prev => prev.filter(n => n.id !== note.id));
        } else if (draggedItem.sourceFolderId) {
          setFolders(prev => prev.map(f => 
            f.id === draggedItem.sourceFolderId 
              ? { ...f, notes: f.notes.filter((n:any) => n.id !== note.id) }
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
  


    return (
      <>
        <ColorPicker
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          handleNewNote={handleNewNote}
        />
        
        {/* My Notes Section */}
        <div className="space-y-2">
          <div 
            onClick={toggleMyNotes}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null, 'quick', null)}
            className="flex items-center gap-2 cursor-pointer rounded p-1 transition-colors text-foreground/40 hover:text-foreground/50"
          >
            {myNotesExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <h3 className="text-sm font-semibold tracking-tight">My Notes</h3>
          </div>
          
          {myNotesExpanded && (
            <div 
              className="space-y-1 animate-in slide-in-from-top-1 min-h-[40px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, null, 'quick', null)}
            >
              {quickNotes.length === 0 && (
                <div className="text-xs text-muted-foreground/50 italic p-2 text-center border-2 border-dashed border-border/50 rounded-lg">
                  Drop notes here
                </div>
              )}
              {quickNotes.map((note: any) => (
                <div 
                  onClick={() => handleOpenNote(note.id)}
                  key={note.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, note, 'quick')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, null, 'quick', note.id)}
                  className={`group relative flex items-center gap-2 p-1 hover:bg-accent/30 rounded-lg transition-colors cursor-pointer 
                    ${draggedItem?.id === note.id && 'opacity-50'}
                    ${activeMenu === `quick-${note.id}` && 'bg-accent/30'}`
                  }
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  <div style={{ backgroundColor: note.color }} className={`w-3 h-3 rounded-sm border border-border flex-shrink-0`}></div>
                  <span className="text-xs text-foreground flex-1 truncate">{note.title}</span>
                  <button 
                    ref={buttonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(`quick-${note.id}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer rounded transition-all"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  {activeMenu === `quick-${note.id}` && (
                    <div ref={menuRef} className="text-xs absolute right-0 translate-x-23 translate-y-4 bg-card border border-border rounded-lg shadow-xl p-1 z-50 animate-in slide-in-from-left-5">
                      <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent/30 rounded text-xs text-foreground cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button onClick={(e) => {e.stopPropagation(); handleDeleteNote(note.id)}} className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-destructive/10 rounded text-xs text-destructive cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Folders Section */}
        <div className="space-y-2">
          <div 
            onClick={toggleFoldersSection}
            className="flex items-center gap-2 cursor-pointer rounded p-1 transition-colors text-foreground/40 hover:text-foreground/50"
          >
            {foldersExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <h3 className="text-sm font-semibold tracking-tight">Folders</h3>
          </div>
          
          {foldersExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-1">
              {folders.map((folder: any) => (
                <div key={folder.id} className="space-y-1">
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, folder, 'folder')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, folder.id, 'folder', folder.id)}
                    className={`group flex items-center gap-2 p-1 hover:bg-accent/30 rounded-lg transition-colors cursor-pointer 
                      ${draggedItem?.id === folder.id && draggedItem?.type === 'folder' && 'opacity-50'}
                      ${activeMenu === `folder-${folder.id}` && 'bg-accent/30'}`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolder(folder.id);
                      }}
                      className="p-0.5 text-foreground/40 hover:text-foreground/80 cursor-pointer rounded transition-colors"
                    >
                      {expandedFolders[folder.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div className="relative w-4 h-4 text-primary">
                      <FolderIcon
                        className={`
                          absolute inset-0 w-4 h-4 
                          transition-all duration-300 ease-in-out
                          ${expandedFolders[folder.id] ? 'opacity-0 scale-75' : 'opacity-100 scale-100 z-10'}
                        `}
                      />
                      <FolderOpenIcon
                        isExpanded={expandedFolders[folder.id]}
                        className={`
                          absolute inset-0 w-4 h-4 
                          transition-all duration-300 ease-in-out
                          ${expandedFolders[folder.id] ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-75'}
                        `}
                      />
                    </div>
                    {editingFolderId === folder.id ? (
                      <div className="flex-1 min-w-0">
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleSaveFolderName(folder.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveFolderName(folder.id);
                            if (e.key === "Escape") {
                              if (newFolderTempId === folder.id) {
                                setFolders((prev) => prev.filter((f) => f.id !== folder.id));
                                setNewFolderTempId(null);
                              }
                              setEditingFolderId(null);
                            }
                          }}
                          className="w-full min-w-0 text-xs bg-transparent border-b border-border/50 focus:outline-none focus:border-primary text-foreground truncate px-0.5"
                          placeholder="Enter folder name"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-foreground flex-1 truncate">{folder.name}</span>
                    )}


                    <span className="text-xs text-muted-foreground">{folder?.notes?.length}</span>
                    <button
                      ref={buttonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(`folder-${folder.id}`);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    {activeMenu === `folder-${folder.id}` && (
                      <div ref={menuRef} className="absolute right-0 translate-x-25 translate-y-7 bg-card border border-border rounded-lg shadow-xl p-1 z-30 animate-in slide-in-from-left-5">
                        <button onClick={() => handleNewNote("", folder.id)} className="border-b border-border/50 flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent/30 rounded text-xs text-foreground whitespace-nowrap cursor-pointer">
                          <Plus className="w-3 h-3" />
                          New Note
                        </button>
                        <button onClick={() => handleRenameFolder(folder.id, folder.name)} className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent/30 rounded text-xs text-foreground whitespace-nowrap cursor-pointer">
                          <Edit2 className="w-3 h-3" />
                          Rename
                        </button>
                        <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-destructive/10 rounded text-xs text-destructive whitespace-nowrap cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <ConfirmModal
                    show={showConfirm}
                    title="Delete Folder?"
                    message="This will delete all notes inside. Are you sure?"
                    onCancel={() => setShowConfirm(false)}
                    onConfirm={() => handleDeleteFolder(folder.id)}
                  />
                  
                  {expandedFolders[folder.id] && (
                    <div className="ml-6 space-y-1 animate-in slide-in-from-top-10">
                      {folder?.notes?.map((note: any) => (
                        <div 
                          key={note.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, note, 'note', folder.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, folder.id, 'note', note.id)}
                          className={`group relative flex items-center gap-2 p-1 hover:bg-accent/30 rounded-lg transition-colors cursor-pointer 
                            ${draggedItem?.id === note.id && 'opacity-50'}
                            ${activeMenu === `note-${note.id}` && 'bg-accent/30'}`
                          }
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          <div style={{ backgroundColor: note.color }} className={`w-2 h-2 rounded-sm border border-border flex-shrink-0`}></div>
                          <span className="text-xs text-foreground flex-1 truncate">{note.title}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(`note-${note.id}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer rounded transition-all"
                          >
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                          
                          {activeMenu === `note-${note.id}` && (
                            <div ref={menuRef} className="absolute right-0 translate-x-23 translate-y-4 bg-card border border-border rounded-lg shadow-xl p-1 z-30 animate-in slide-in-from-left-5">
                              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent rounded text-xs text-foreground cursor-pointer">
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button onClick={() => handleDeleteNote(note.id)} className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-destructive/10 rounded text-xs text-destructive cursor-pointer">
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleCreateFolder} className="w-full flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground/50 italic border-2 border-dashed border-border/70 hover:border-primary hover:bg-accent/50 rounded-lg transition-all  hover:text-muted-foreground cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </>
    );
}