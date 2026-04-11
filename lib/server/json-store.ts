import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir()
  const path = join(DATA_DIR, filename)
  try {
    const raw = await readFile(path, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir()
  const path = join(DATA_DIR, filename)
  await writeFile(path, JSON.stringify(data, null, 2), 'utf8')
}
