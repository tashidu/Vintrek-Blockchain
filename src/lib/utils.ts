import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, length: number = 8): string {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function formatAda(lovelace: string | number): string {
  try {
    const amount = typeof lovelace === 'string' ? parseInt(lovelace) : lovelace
    const ada = amount / 1000000
    return `${ada.toFixed(2)} ADA`
  } catch {
    return '0.00 ADA'
  }
}

export function formatTrekTokens(amount: number): string {
  return `${amount.toLocaleString()} TREK`
}

export function generateTrailId(): string {
  return `trail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateBookingId(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function isValidCardanoAddress(address: string): boolean {
  // Basic Cardano address validation
  return address.startsWith('addr1') && address.length >= 50
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
