import { ChevronDown, ChevronRight, Edit2, GripVertical, MoreVertical, Plus, Trash2 } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { FolderOpenIcon } from "./ui/FolderOpenIcon";
import { FolderIcon } from "./ui/FolderIcon";

export const ExpandedSidebar = ({ 
  showColorPicker, 
  setShowColorPicker, 
  handleNewNote,
  quickNotes,
  folders,
  expandedFolders,
  toggleFolder,
  activeMenu,
  toggleMenu,

  onDragStart,
  onDragOver,
  onDrop,
  draggedItem,

  myNotesExpanded,
  foldersExpanded,
  toggleMyNotes,
  toggleFoldersSection
}: any) => {
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
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, null, 'quick', null)}
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
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, null, 'quick', null)}
            >
              {quickNotes.length === 0 && (
                <div className="text-xs text-muted-foreground/50 italic p-2 text-center border-2 border-dashed border-border/50 rounded-lg">
                  Drop notes here
                </div>
              )}
              {quickNotes.map((note: any) => (
                <div 
                  key={note.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, note, 'quick')}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, null, 'quick', note.id)}
                  className={`group relative flex items-center gap-2 p-1 hover:bg-accent/30 rounded-lg transition-colors cursor-pointer 
                    ${draggedItem?.id === note.id && 'opacity-50'}
                    ${activeMenu === `quick-${note.id}` && 'bg-accent/30'}`
                  }
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  <div className={`w-3 h-3 ${note.color} rounded-sm border border-border flex-shrink-0`}></div>
                  <span className="text-xs text-foreground flex-1 truncate">{note.title}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(`quick-${note.id}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer rounded transition-all"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  {activeMenu === `quick-${note.id}` && (
                    <div className="text-xs absolute right-0 translate-x-23 translate-y-4 bg-card border border-border rounded-lg shadow-xl p-1 z-50 animate-in slide-in-from-left-5">
                      <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent/30 rounded text-xs text-foreground cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-destructive/10 rounded text-xs text-destructive cursor-pointer">
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
                    onDragStart={(e) => onDragStart(e, folder, 'folder')}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, folder.id, 'folder', folder.id)}
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
                    <span className="text-xs text-foreground flex-1">{folder.name}</span>
                    <span className="text-xs text-muted-foreground">{folder.notes.length}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(`folder-${folder.id}`);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    {activeMenu === `folder-${folder.id}` && (
                      <div className="absolute right-0 translate-x-25 translate-y-7 bg-card border border-border rounded-lg shadow-xl p-1 z-30 animate-in slide-in-from-left-5">
                        <button className="border-b border-border/50 flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent/30 rounded text-xs text-foreground whitespace-nowrap cursor-pointer">
                          <Plus className="w-3 h-3" />
                          New Note
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent/30 rounded text-xs text-foreground whitespace-nowrap cursor-pointer">
                          <Edit2 className="w-3 h-3" />
                          Rename
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-destructive/10 rounded text-xs text-destructive whitespace-nowrap cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {expandedFolders[folder.id] && (
                    <div className="ml-6 space-y-1 animate-in slide-in-from-top-10">
                      {folder.notes.map((note: any) => (
                        <div 
                          key={note.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, note, 'note', folder.id)}
                          onDragOver={onDragOver}
                          onDrop={(e) => onDrop(e, folder.id, 'note', note.id)}
                          className={`group relative flex items-center gap-2 p-1 hover:bg-accent/30 rounded-lg transition-colors cursor-pointer 
                            ${draggedItem?.id === note.id && 'opacity-50'}
                            ${activeMenu === `note-${note.id}` && 'bg-accent/30'}`
                          }
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          <div className={`w-2 h-2 ${note.color} rounded-sm border border-border flex-shrink-0`}></div>
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
                            <div className="absolute right-0 translate-x-23 translate-y-4 bg-card border border-border rounded-lg shadow-xl p-1 z-30 animate-in slide-in-from-left-5">
                              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-accent rounded text-xs text-foreground cursor-pointer">
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-destructive/10 rounded text-xs text-destructive cursor-pointer">
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

        <button className="w-full flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground/50 italic border-2 border-dashed border-border/70 hover:border-primary hover:bg-accent/50 rounded-lg transition-all  hover:text-muted-foreground cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </>
    );
}