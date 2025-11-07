'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ShortcutHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault()
        e.stopPropagation()
        router.push('/dashboard/new?color=%23FFE6A7')
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true } as any)
  }, [router])

  return null
}
