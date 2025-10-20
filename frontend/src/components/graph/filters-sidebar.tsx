'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FiltersSidebarProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function FiltersSidebar({ isOpen, onClose, children }: FiltersSidebarProps) {
  return (
    <div
      className={`
        fixed top-0 left-0 h-screen w-96 bg-background border-r shadow-2xl
        transform transition-transform duration-300 ease-in-out z-[100]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-semibold">Search & Filters</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-73px)] p-4">
        {children}
      </div>
    </div>
  )
}

