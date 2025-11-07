"use client"
import * as React from "react"

interface EditableTitleProps {
  title: string | undefined
  setTitle: React.Dispatch<React.SetStateAction<string | undefined>>
  saveTitle: (newTitle: string) => void
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  setTitle,
  saveTitle,
}) => {
    const [initialTitle, setInitialTitle] = React.useState(title) 

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const input = e.target
        requestAnimationFrame(() => {
            input.select()
        })
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setTitle(newValue)
    }

    const focusEditor = () => {
        const editorEl = document.querySelector(".simple-editor") as HTMLElement | null
        if (editorEl){
            editorEl.focus()
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(editorEl)
            range.collapse(false)
            selection?.removeAllRanges()
            selection?.addRange(range)
        } 
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Backspace"].includes(e.key)) {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
        }
        
        if (e.key === "Enter") {
            e.preventDefault()
            if(title) handleSave()
            e.currentTarget.blur()
            requestAnimationFrame(focusEditor)
        }
    }
    
    const handleSave = () => {
        const newTitle = title?.trim()
        if (newTitle && (newTitle !== initialTitle)){
            saveTitle(newTitle.trim())
            setInitialTitle(newTitle)
        }
        else if(!newTitle){
            saveTitle("Untitled")
            setInitialTitle(newTitle)
        }
    }

  return (
      <input
        type="text"
        value={title}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyDownCapture={(e) => {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Backspace", "Tab"].includes(e.key)) {
              e.stopPropagation();
            }
        }}
        onBlur={handleSave}
        placeholder="Untitled"
        className={`
          flex-shrink-0 bg-transparent border-none focus:border focus:outline-none border-rose-500 px-2 py-1 rounded-md
          sm:min-w-[120px] sm:max-w-[400px] font-medium tracking-normal truncate transition-colors focus:bg-primary-foreground/80  hover:bg-primary-foreground/80 
        `}
        style={{ fontFamily: 'var(--font-playfair)' }} 
      />
  )
}
