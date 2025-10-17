import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format course code (e.g., CS 246)
 */
export function formatCourseCode(subject: string, catalogNumber: string): string {
  return `${subject} ${catalogNumber}`
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Parse term string (e.g., "F2025" -> "Fall 2025")
 */
export function formatTerm(term?: string): string {
  if (!term) return 'Unscheduled'

  const termMap: Record<string, string> = {
    F: 'Fall',
    W: 'Winter',
    S: 'Spring',
  }

  const letter = term.charAt(0)
  const year = term.slice(1)

  return `${termMap[letter] || letter} ${year}`
}

/**
 * Generate a unique color based on subject
 */
export function getSubjectColor(subject: string): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ]

  const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/**
 * Download JSON file
 */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

