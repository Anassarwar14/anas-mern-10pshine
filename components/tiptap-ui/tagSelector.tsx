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
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) onChange([...selectedTags, tag])
    setInput("")
    setOpen(false)
    // setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleRemove = (tag: string) => {
    onChange(selectedTags.filter(t => t !== tag))
  }

  const handleCreate = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() && !selectedTags.includes(input.trim())) {
      e.preventDefault()
      onChange([...selectedTags, input.trim()])
      setInput("")
      setOpen(false)
      // setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} 
      // onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <div className="relative w-56">
            <Command>
              <CommandInput
                ref={inputRef}
                value={input}
                onValueChange={(val) => {
                  setInput(val)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleCreate}
                placeholder="Add a tag..."
                className="h-9"
              />
            </Command>
          </div>
        </PopoverTrigger>

        {predefinedTags.length > 0 && (
          <PopoverContent
            className="w-56 p-0"
            // onOpenAutoFocus={(e) => e.preventDefault()}
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
                      className={cn(selectedTags.includes(tag) && "opacity-50")}
                    >
                      {tag}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        )}

        {selectedTags.map(tag => (
          <PopoverContent>
            <Badge
            key={tag}
            variant="outline"
              className="flex items-center gap-1 px-2 py-1 cursor-pointer"
              onClick={() => handleRemove(tag)}
            >
              {tag}
              <X className="w-3 h-3 opacity-60 hover:opacity-100" />
            </Badge>
          </PopoverContent>
        ))}
      </Popover>
    </div>
  )
}
