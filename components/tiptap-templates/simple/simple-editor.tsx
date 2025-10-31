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

import { CloudAlert, CloudCheck, CloudUpload } from "lucide-react";
import { TagSelector } from "@/components/tiptap-ui/tagSelector"
import { ResponsiveToolbar } from "@/components/tiptap-ui/responsiveToolbar"


interface SimpleEditorProps {
  mode: 'create' | 'edit'
  noteId?: number          // Only for edit mode
  folderId?: number | null // create/edit
  title?: string
  initialContent?: any
  initialColor?: string    // create/edit
  initialTags?: string[]   // create/edit
  initialPinned?: boolean
  initialFavorite?: boolean
  initialArchive?: boolean
  initialOrder?: number | null
}


function lightenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
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
  saveNote: (content?: any, tags?: string[]) => void
}) => {
  return (
    <>
      <Spacer />
      <h2 style={{ fontFamily: 'var(--font-playfair)' }} className=" font-medium  text-secondary-foreground tracking-normal truncate hover:bg-gray-100 rounded px-1 py-0.5 cursor-text min-w-2 w-auto transition-colors">
        {title}
      </h2>
      <div className="mx-4 text-xs">
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
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
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

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>


      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <div >
          <TagSelector
            predefinedTags={predefinedTags}
            selectedTags={selectedTags}
            onChange={(newTags) => {
              setSelectedTags(newTags)
              saveNote(undefined, newTags) // trigger save only for tags
            }}
          />
        </div>
      </ToolbarGroup>
      
      <Spacer />
      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
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


  const saveNote = async (content?: any, tags?: string[]) => {
    if (!currentNoteId && mode === "create" && !isCreating) {
      setIsCreating(true)
      try {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content || editor?.getJSON(),
            folderId,
            color: initialColor || "#FFE6A7",
            tagNames: tags || selectedTags,
          }),
        })

        const newNote = await response.json()
        setCurrentNoteId(newNote.id)
        window.history.replaceState(null, "", `/dashboard/${newNote.id}`)
      } catch (error) {
        console.error("Failed to create note:", error)
      } finally {
        setIsCreating(false)
      }
    } else if (currentNoteId) {
      setSaveStatus("saving")
      try {
        const response = await fetch(`/api/notes/${currentNoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
    <div className="simple-editor-wrapper px-10 py-5">
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
