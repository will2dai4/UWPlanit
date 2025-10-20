'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FACULTIES, LEVELS, SUBJECTS, TERMS } from '@/lib/constants'
import type { CourseFilters } from '@/types'

interface FiltersPanelProps {
  filters: CourseFilters
  onChange: (filters: CourseFilters) => void
  onClear: () => void
}

export function FiltersPanel({ filters, onChange, onClear }: FiltersPanelProps) {
  const updateFilter = <K extends keyof CourseFilters>(key: K, value: CourseFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.subject || filters.level || filters.term || filters.faculty

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select
            value={filters.subject || 'all'}
            onValueChange={(value) => updateFilter('subject', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            value={filters.level?.toString() || 'all'}
            onValueChange={(value) => updateFilter('level', value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {LEVELS.map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Term */}
        <div className="space-y-2">
          <Label htmlFor="term">Term Offered</Label>
          <Select
            value={filters.term || 'all'}
            onValueChange={(value) => updateFilter('term', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="term">
              <SelectValue placeholder="All terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All terms</SelectItem>
              {TERMS.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Faculty */}
        <div className="space-y-2">
          <Label htmlFor="faculty">Faculty</Label>
          <Select
            value={filters.faculty || 'all'}
            onValueChange={(value) => updateFilter('faculty', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="faculty">
              <SelectValue placeholder="All faculties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All faculties</SelectItem>
              {FACULTIES.map((faculty) => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

