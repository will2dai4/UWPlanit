'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, FileText } from 'lucide-react'
import type { ChecklistItem } from '@/types'

interface ChecklistPanelProps {
  items: ChecklistItem[]
  onCreateItem: (data: { label: string; group_key?: string }) => void
  onUpdateItem: (itemId: string, data: Partial<ChecklistItem>) => void
  onDeleteItem: (itemId: string) => void
  onParseText?: (text: string) => void
}

export function ChecklistPanel({ items, onCreateItem, onUpdateItem, onDeleteItem, onParseText }: ChecklistPanelProps) {
  const [newItemLabel, setNewItemLabel] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isParseDialogOpen, setIsParseDialogOpen] = useState(false)
  const [parseText, setParseText] = useState('')

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return

    onCreateItem({ label: newItemLabel.trim() })
    setNewItemLabel('')
    setIsAddDialogOpen(false)
  }

  const handleParseText = () => {
    if (!parseText.trim() || !onParseText) return

    onParseText(parseText.trim())
    setParseText('')
    setIsParseDialogOpen(false)
  }

  const groupedItems = items.reduce(
    (acc, item) => {
      const key = item.group_key || 'ungrouped'
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {} as Record<string, ChecklistItem[]>
  )

  const doneCount = items.filter((item) => item.is_done).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Checklist</h3>
            <p className="text-sm text-muted-foreground">
              {doneCount} of {totalCount} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onParseText && (
              <Dialog open={isParseDialogOpen} onOpenChange={setIsParseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Parse Checklist Text</DialogTitle>
                    <DialogDescription>
                      Paste checklist text to automatically create items. Each line will become a checklist item.
                    </DialogDescription>
                  </DialogHeader>
                  <textarea
                    className="w-full min-h-[200px] p-3 border rounded-md resize-y"
                    placeholder="- Item 1&#10;- Item 2&#10;- Item 3"
                    value={parseText}
                    onChange={(e) => setParseText(e.target.value)}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsParseDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleParseText}>Parse & Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Checklist Item</DialogTitle>
                  <DialogDescription>Create a new item for your course checklist.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Item Label</Label>
                    <Input
                      id="label"
                      placeholder="e.g., Complete CS 246 assignment"
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddItem()
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
          <div key={groupKey}>
            {groupKey !== 'ungrouped' && (
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">{groupKey}</h4>
            )}
            <div className="space-y-2">
              {groupItems.map((item) => (
                <ChecklistItemRow
                  key={item.checklist_item_id}
                  item={item}
                  onToggle={(isDone) => onUpdateItem(item.checklist_item_id, { is_done: isDone })}
                  onDelete={() => onDeleteItem(item.checklist_item_id)}
                />
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No checklist items yet</p>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Item
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ChecklistItemRowProps {
  item: ChecklistItem
  onToggle: (isDone: boolean) => void
  onDelete: () => void
}

function ChecklistItemRow({ item, onToggle, onDelete }: ChecklistItemRowProps) {
  return (
    <div className="flex items-start gap-3 group">
      <Checkbox checked={item.is_done} onCheckedChange={(checked) => onToggle(checked === true)} className="mt-1" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${item.is_done ? 'line-through text-muted-foreground' : ''}`}>{item.label}</p>
        {item.required_count && (
          <p className="text-xs text-muted-foreground mt-1">Required: {item.required_count}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

