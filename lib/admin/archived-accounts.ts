import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

/**
 * Ids of archived accounts.
 *
 * RLS already hides archived accounts from every signed-in user, but the
 * service-role client BYPASSES RLS. Any route that reads with
 * `tryGetSupabaseAdmin()` must drop these ids itself.
 *
 * Fail closed: on error the caller must refuse to answer rather than risk
 * returning an archived user's data.
 */
export async function fetchArchivedUserIds(
  reader: Client,
): Promise<{ ids: Set<string>; error: string | null }> {
  const ids = new Set<string>()
  const pageSize = 1000
  for (let from = 0; from < 100000; from += pageSize) {
    const { data, error } = await reader
      .from('profiles')
      .select('id')
      .not('archived_at', 'is', null)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) return { ids, error: error.message }
    for (const row of data ?? []) ids.add(row.id)
    if ((data ?? []).length < pageSize) break
  }
  return { ids, error: null }
}

/** Keep only rows whose owner is not archived. */
export function withoutArchived<T>(rows: T[] | null | undefined, archived: Set<string>, ownerOf: (row: T) => string): T[] {
  if (!rows) return []
  if (archived.size === 0) return rows
  return rows.filter((row) => !archived.has(ownerOf(row)))
}
