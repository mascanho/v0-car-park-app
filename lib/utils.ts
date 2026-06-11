import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const STORAGE_BUCKET = 'Employee Photos'
const PROJECT_REF = 'pmjdrswfxxuaqayojccz'

export function getPhotoUrl(email: string, photo?: string | null): string | null {
  if (photo) return photo
  const filename = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-') + '.jpeg'
  const bucket = encodeURIComponent(STORAGE_BUCKET)
  return `https://${PROJECT_REF}.supabase.co/storage/v1/object/public/${bucket}/${filename}`
}
