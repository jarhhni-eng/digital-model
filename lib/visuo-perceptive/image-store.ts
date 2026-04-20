'use client'
import { VP_IMAGE_STORE_KEY } from './index'

type ImageMap = Record<string, string>

function read(): ImageMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(VP_IMAGE_STORE_KEY)
    return raw ? (JSON.parse(raw) as ImageMap) : {}
  } catch {
    return {}
  }
}

function write(map: ImageMap) {
  try {
    window.localStorage.setItem(VP_IMAGE_STORE_KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('vp-images-changed'))
  } catch (e) {
    console.warn('vp image store full', e)
  }
}

export function listStoredImages(): string[] {
  return Object.keys(read())
}

export function getImageSrc(filename: string): string {
  const map = read()
  if (map[filename]) return map[filename]
  return `/images/visuo-perceptive/${filename}`
}

export async function saveImage(filename: string, file: File): Promise<void> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
  const map = read()
  map[filename] = dataUrl
  write(map)
}

export function removeImage(filename: string) {
  const map = read()
  delete map[filename]
  write(map)
}

export function clearAllImages() {
  write({})
}
