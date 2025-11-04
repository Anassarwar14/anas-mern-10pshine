"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"


// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import { ChevronLeft, ChevronRight, CloudAlert, CloudCheck, CloudUpload } from "lucide-react";
import { TagSelector } from "@/components/tiptap-ui/tagSelector"
import { useNotes } from "@/context/notesContext"
import { lightenColor } from "@/lib/utils"


interface SimpleEditorProps {
  mode: 'create' | 'edit'
  noteId?: number
  folderId?: number | null
  title?: string
  initialContent?: any
  initialColor?: string
  initialTags?: string[]
  initialPinned?: boolean
  initialFavorite?: boolean
  initialArchive?: boolean
  initialOrder?: number | null
}


const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  saveStatus,
  title,
  predefinedTags,
  selectedTags,
  setSelectedTags,
  saveNote
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  saveStatus: string
  title: string | undefined
  predefinedTags: string[]
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  saveNote: (content?: any, tags?: string[], userTitle?: string) => void
}) => {

  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const el = React.useRef<any | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = React.useState(false);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };


  React.useEffect(() => {
    if (!isEditing && el.current && title) {
      el.current.innerText = title || "Untitled";
    }
  }, [title, isEditing]);

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = (e: any) => {
    const newTitle = e.target.innerText.trim();
    setIsEditing(false)
    if (newTitle !== title) saveNote(undefined,undefined,newTitle);
  };

  const handleKeyDown = (e: any) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Backspace"].includes(e.key)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }

    if (e.key === "Tab") {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur(); 
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.target.innerText = title;
      e.target.blur();
    }
  };

  return (
     <>
      {showLeftArrow && (
        <Button 
          data-style="ghost" 
          onClick={() => scroll('left')}
          className="cursor-pointer flex-shrink-0 sticky left-0 z-10 bg-gradient-to-r from-[var(--toolbar-bg)] via-transparent to-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Spacer />
        <h2 
          ref={el} 
          contentEditable 
          suppressContentEditableWarning
          tabIndex={-1}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onKeyDownCapture={(e) => {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Backspace"].includes(e.key)) {
              e.stopPropagation();
            }
          }}
          onBlur={handleBlur} 
          style={{ fontFamily: 'var(--font-playfair)' }} 
          className="font-medium text-secondary-foreground tracking-normal hover:bg-primary-foreground/80 focus:bg-primary-foreground/80 rounded px-2 py-1 cursor-text sm:min-w-[120px] sm:max-w-[400px] whitespace-nowrap overflow-hidden text-ellipsis transition-colors focus:outline-none flex-shrink-0"
        >
          {title || "Untitled"}
        </h2>
        <div className="mx-2 text-xs flex-shrink-0">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-gray-400"><CloudUpload className="w-4 h-4"/> Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600"><CloudCheck className="w-4 h-4"/> Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-red-600"><CloudAlert className="w-4 h-4"/> Failed to save</span>
          )}
        </div>
        <ToolbarGroup className="flex-shrink-0">
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>

        <ToolbarSeparator className="flex-shrink-0" />

        <ToolbarGroup className="flex-shrink-0">
          <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
          <ListDropdownMenu
            types={["bulletList", "orderedList", "taskList"]}
            portal={isMobile}
          />
          <BlockquoteButton />
          <CodeBlockButton />
        </ToolbarGroup>

        <ToolbarSeparator className="flex-shrink-0" />

        <ToolbarGroup className="flex-shrink-0">
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="strike" />
          <MarkButton type="code" />
          <MarkButton type="underline" />
          {!isMobile ? (
            <ColorHighlightPopover />
          ) : (
            <ColorHighlightPopoverButton onClick={onHighlighterClick} />
          )}
          {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        </ToolbarGroup>

        <ToolbarSeparator className="flex-shrink-0" />

        <ToolbarGroup className="flex-shrink-0">
          <MarkButton type="superscript" />
          <MarkButton type="subscript" />
        </ToolbarGroup>

        <ToolbarSeparator className="flex-shrink-0" />

        <ToolbarGroup className="flex-shrink-0">
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
          <TextAlignButton align="justify" />
        </ToolbarGroup>

        <ToolbarSeparator className="flex-shrink-0" />

        <ToolbarGroup className="flex-shrink-0">
          <ImageUploadButton text="Add" />
        </ToolbarGroup>

        {isMobile && <ToolbarSeparator className="flex-shrink-0" />}

        <ToolbarGroup className="flex-shrink-0">
          <TagSelector
            predefinedTags={predefinedTags}
            selectedTags={selectedTags}
            onChange={(newTags) => {
              setSelectedTags(newTags)
              saveNote(undefined, newTags)
            }}
          />
        </ToolbarGroup>
        
        <Spacer />
        <ToolbarGroup className="flex-shrink-0">
          <ThemeToggle />
        </ToolbarGroup>
      </div>

      {showRightArrow && (
        <Button 
          data-style="ghost" 
          onClick={() => scroll('right')}
          className="cursor-pointer flex-shrink-0 sticky right-0 z-10 bg-gradient-to-l from-transparent via-transparent to-[var(--toolbar-bg)]"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({ 
  mode,
  noteId,
  folderId,
  title,
  initialContent,
  initialColor,
  initialTags,
  initialPinned,
  initialFavorite,
  initialArchive,
  initialOrder
}: SimpleEditorProps) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const { setQuickNotes } = useNotes()
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [currentTitle, setCurrentTitle] = React.useState(title || 'Untitled')
  const [isCreating, setIsCreating] = React.useState(false)
  const [currentNoteId, setCurrentNoteId] = React.useState(noteId)
  const [selectedTags, setSelectedTags] = React.useState<string[]>(initialTags || [])
  const predefinedTags = ["Work", "Personal", "Ideas", "Important", "Reference"]
  
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const [isDark, setIsDark] = React.useState(false)
  const [toolbarColor, setToolbarColor] = React.useState("")
  const [editorColor, setEditorColor] = React.useState("")


  const saveNote = async (content?: any, tags?: string[], userTitle?: string) => {
    if (!currentNoteId && mode === "create" && !isCreating) {
      setIsCreating(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userTitle,
            content: content || editor?.getJSON(),
            folderId,
            color: initialColor || "#FFE6A7",
            tagNames: tags || selectedTags,
          }),
        })

        const newNote = await response.json()
        setCurrentNoteId(newNote.id)
        window.history.replaceState(null, "", `/dashboard/${newNote.id}`)
        if (newNote.title !== "Untitled") {
          setCurrentTitle(newNote.title)
        }
        setQuickNotes(prev => [...prev, newNote])
      } catch (error) {
        console.error("Failed to create note:", error)
      } finally {
        setIsCreating(false)
      }
    } else if (currentNoteId) {
      setSaveStatus("saving")
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notes/${currentNoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userTitle,
            content: content || editor?.getJSON(),
            folderId,
            color: initialColor || "#FFE6A7",
            tagNames: tags || selectedTags,
            isPinned: initialPinned,
            isFavorite: initialFavorite,
            isArchived: initialArchive,
            order: initialOrder,
          }),
        })

        if (!response.ok) throw new Error("Failed to save")

        const updatedNote = await response.json()
        if (updatedNote.title && updatedNote.title !== currentTitle) {
          setCurrentTitle(updatedNote.title)
        }
        setQuickNotes(prev => prev.map(n => (n.id === updatedNote.id ? updatedNote : n)))
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
        console.log("✓ Note saved")
      } catch (error) {
        console.error("✗ Failed to save:", error)
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 5000)
      }
    }
  }


  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleKeyDown: (view, event) => {
      // Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault() // prevent browser “save page” dialog
        console.log("Manual save triggered ✨")
         console.log("Editor state:", {
          hasEditor: !!view,
          currentNoteId,
          mode,
          isCreating
        });
        
        editor && saveNote(editor.getJSON())
        return true
      }
      return false
    } ,
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: initialContent || {
      type: "doc",
      content: [{ type: "paragraph" }]
    },
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(async () => {
       saveNote(editor.getJSON(), selectedTags)
      }, 2000) // 2 second debounce
    },
  })

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])


  React.useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!initialColor) return
    if (isDark) {
      setToolbarColor(lightenColor(initialColor, -35))
      setEditorColor(lightenColor(initialColor, -20))
    } else {
      setToolbarColor(lightenColor(initialColor, 10))
      setEditorColor(lightenColor(initialColor, 25))
    }
  }, [initialColor, isDark])


  return (
    <div className="simple-editor-wrapper px-5 sm:px-10 py-5">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          variant="floating"
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
            ["--toolbar-bg" as any]: toolbarColor || "#FFFFFF"
          }}
        >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
                saveStatus={saveStatus}
                title={currentTitle}
                predefinedTags={predefinedTags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                saveNote={saveNote}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
          style={{  ["--editor-bg" as any]: editorColor || "#FFFFFF"}}
        />
      </EditorContext.Provider>
    </div>
  )
}
