import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { supabase } from '../../lib/supabase/client'

export function DynamicBreadcrumb() {
  const location = useLocation()
  const { aziendaId, personaId, certificatoId } = useParams<{
    aziendaId?: string
    personaId?: string
    certificatoId?: string
  }>()

  const [nomeAzienda, setNomeAzienda] = useState<string>('')
  const [nomePersona, setNomePersona] = useState<string>('')
  const [nomeCertificato, setNomeCertificato] = useState<string>('')

  useEffect(() => {
    async function fetchNames() {
      if (aziendaId) {
        const { data: azienda } = await supabase
          .from('aziende')
          .select('nome')
          .eq('id', aziendaId)
          .single()
        if (azienda) setNomeAzienda(azienda.nome)
      }

      if (personaId) {
        const { data: persona } = await supabase
          .from('persone')
          .select('nome, cognome')
          .eq('id', personaId)
          .single()
        if (persona) setNomePersona(`${persona.cognome} ${persona.nome}`)
      }

      if (certificatoId) {
        const { data: certificato } = await supabase
          .from('certificati')
          .select('titolo')
          .eq('id', certificatoId)
          .single()
        if (certificato) setNomeCertificato(certificato.titolo)
      }
    }

    fetchNames()
  }, [aziendaId, personaId, certificatoId])

  // ⚠️ L'early return va messo DOPO tutti gli Hook, non prima!
  if (location.pathname === paths.home) {
    return null
  }

  return (
    <nav className="breadcrumb" aria-label="Percorso di navigazione">
      <ol>
        {/* Livello 1: Home / Aziende */}
        <li>
          <Link to={paths.aziende.list}>Aziende</Link>
        </li>

        {/* Livello 2: Azienda */}
        {aziendaId && (
          <li>
            {!personaId ? (
              <span>{nomeAzienda || 'Caricamento...'}</span>
            ) : (
              <Link to={paths.aziende.detail(aziendaId)}>
                {nomeAzienda || 'Azienda'}
              </Link>
            )}
          </li>
        )}

        {/* Livello 3: Persona */}
        {personaId && (
          <li>
            {!certificatoId ? (
              <span>{nomePersona || 'Caricamento...'}</span>
            ) : (
              <Link to={paths.aziende.persone.detail(aziendaId!, personaId)}>
                {nomePersona || 'Persona'}
              </Link>
            )}
          </li>
        )}

        {/* Livello 4: Certificato */}
        {certificatoId && (
          <li>
            <span>{nomeCertificato || 'Certificato'}</span>
          </li>
        )}
      </ol>
    </nav>
  )
}