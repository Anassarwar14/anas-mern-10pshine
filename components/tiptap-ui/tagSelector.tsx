"use client"

import * as React from "react"
import { Command, CommandGroup, CommandItem, CommandInput } from "@/components/ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagSelectorProps {
  predefinedTags: string[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export function TagSelector({ predefinedTags, selectedTags, onChange }: TagSelectorProps) {
  const [input, setInput] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [localTags, setLocalTags] = React.useState<string[]>(selectedTags)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setLocalTags(selectedTags)
  }, [selectedTags])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (JSON.stringify(localTags) !== JSON.stringify(selectedTags)) {
        onChange(localTags)
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [localTags, onChange, selectedTags])

  const handleSelect = (tag: string) => {
    if (!localTags.includes(tag)) setLocalTags([...localTags, tag])
    setInput("")
    setOpen(false)
  }

  const handleRemove = (tag: string) => {
    setLocalTags(localTags.filter(t => t !== tag))
  }

  const handleCreate = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() && !localTags.includes(input.trim())) {
      e.preventDefault()
      setLocalTags([...localTags, input.trim()])
      setInput("")
      setOpen(false)
    }
  }

   const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(document.activeElement)
      ) {
        setOpen(false)
      }
    }, 100)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Popover open={open}>
        <PopoverTrigger asChild>
          <div className="relative w-40">
            <Command>
              <CommandInput
                ref={inputRef}
                value={input}
                onValueChange={(val) => {
                  setInput(val)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onBlur={handleBlur}
                onKeyDown={handleCreate}
                placeholder="Add a tag..."
                className="h-3"
              />
            </Command>
          </div>
        </PopoverTrigger>

        {predefinedTags.length > 0 && (
          <PopoverContent
            ref={popoverRef}
            className="w-40 p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandGroup>
                {predefinedTags
                  .filter(tag => tag.toLowerCase().includes(input.toLowerCase()))
                  .map(tag => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => handleSelect(tag)}
                      className={cn(localTags.includes(tag) && "opacity-50")}
                    >
                      {tag}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        )}

        {localTags.map(tag => (
          <Badge
            key={tag}
            variant="outline"
            className="flex items-center gap-1 px-2 py-1 cursor-pointer"
            onClick={() => handleRemove(tag)}
          >
            {tag}
            <X className="w-3 h-3 opacity-60 hover:opacity-100" />
          </Badge>
        ))}
      </Popover>
    </div>
  )
}
