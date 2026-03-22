import dynastiesData from '../data/dynasties.json'
import { Dynasty } from '../types'

const dynasties = dynastiesData as Dynasty[]

export function getDynastyForYear(year: number): string {
  const match = dynasties
    .filter(d => year >= d.start && year <= d.end)
    .sort((a, b) => b.start - a.start)[0]
  return match?.name ?? 'Unknown'
}

export function getDynastyColor(dynastyName: string): string {
  return dynasties.find(d => d.name === dynastyName)?.color ?? '#6B7280'
}

export function getAllDynasties(): Dynasty[] {
  return dynasties
}
