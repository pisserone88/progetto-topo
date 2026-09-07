import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import type { Azienda } from '../types/database'

export function useAziende() {
  const [aziende, setAziende] = useState<Azienda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAziende = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: queryError } = await supabase
      .from('aziende')
      .select('*')
      .order('nome')

    if (queryError) {
      setError(queryError.message)
      setAziende([])
    } else {
      setAziende(data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchAziende()
  }, [fetchAziende])

  return { aziende, loading, error, refetch: fetchAziende }
}
