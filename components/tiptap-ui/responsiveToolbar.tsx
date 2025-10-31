// @ts-nocheck
"use client"

import * as React from "react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Toolbar } from "@/components/tiptap-ui-primitive/toolbar"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

export function ResponsiveToolbar({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState<React.ReactNode[]>([])
  const [overflow, setOverflow] = React.useState<React.ReactNode[]>([])

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      const toolbar = container.querySelector(".toolbar-items")
      if (!toolbar) return

      const items = Array.from(toolbar.children)
      const availableWidth = container.offsetWidth - 80 // reserve space for dropdown
      let usedWidth = 0
      const newVisible: React.ReactNode[] = []
      const newOverflow: React.ReactNode[] = []

      for (const item of items) {
        const w = (item as HTMLElement).offsetWidth
        if (usedWidth + w < availableWidth) {
          newVisible.push(item)
          usedWidth += w
        } else {
          newOverflow.push(item)
        }
      }

      setVisible(items.slice(0, newVisible.length).map((i) => i.cloneNode(true)))
      setOverflow(items.slice(newVisible.length).map((i) => i.cloneNode(true)))
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="flex items-center w-full overflow-hidden">
      <div className="toolbar-items flex items-center gap-1 flex-nowrap">
        {children}
      </div>
      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflow.map((item, i) => (
              <DropdownMenuItem key={i} asChild>
                <div dangerouslySetInnerHTML={{ __html: (item as HTMLElement).outerHTML }} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
