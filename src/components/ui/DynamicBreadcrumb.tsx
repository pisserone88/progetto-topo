import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { supabase } from '../../lib/supabase/client'

export function DynamicBreadcrumb() {
  const location = useLocation()
  const params = useParams<{
    settoreId?: string
    aziendaId?: string
    personaId?: string
    certificatoId?: string
  }>()

  const [settoreId, setSettoreId] = useState<string | undefined>(params.settoreId)
  const [nomeSettore, setNomeSettore] = useState<string>('')
  const [nomeAzienda, setNomeAzienda] = useState<string>('')
  const [nomePersona, setNomePersona] = useState<string>('')
  const [nomeCertificato, setNomeCertificato] = useState<string>('')

  // Sincronizza il settoreId se cambia nei parametri della rotta
  useEffect(() => {
    setSettoreId(params.settoreId)
  }, [params.settoreId])

  useEffect(() => {
    async function fetchNames() {
      let currentSettoreId = params.settoreId

      // Se abbiamo l'aziendaId ma non il settoreId nell'URL, ricaviamo il settore dalla tabella aziende
      if (params.aziendaId) {
        const { data: azienda } = await supabase
          .from('aziende')
          .select('nome, settore_id')
          .eq('id', params.aziendaId)
          .single()
        
        if (azienda) {
          setNomeAzienda(azienda.nome)
          if (!currentSettoreId && azienda.settore_id) {
            currentSettoreId = azienda.settore_id
            setSettoreId(azienda.settore_id)
          }
        }
      }

      if (currentSettoreId) {
        const { data: settore } = await supabase
          .from('settori')
          .select('nome')
          .eq('id', currentSettoreId)
          .single()
        if (settore) setNomeSettore(settore.nome)
      }

      if (params.personaId) {
        const { data: persona } = await supabase
          .from('persone')
          .select('nome, cognome')
          .eq('id', params.personaId)
          .single()
        if (persona) setNomePersona(`${persona.cognome} ${persona.nome}`)
      }

      if (params.certificatoId) {
        const { data: certificato } = await supabase
          .from('certificati')
          .select('titolo')
          .eq('id', params.certificatoId)
          .single()
        if (certificato) setNomeCertificato(certificato.titolo)
      }
    }

    fetchNames()
  }, [params.settoreId, params.aziendaId, params.personaId, params.certificatoId])

  // Nascondi il breadcrumb nella home o nella lista principale dei settori
  if (location.pathname === paths.home || location.pathname === paths.settori.list) {
    return null
  }

  // Gestione per la lista generale di tutte le aziende (senza settore)
  if (location.pathname === paths.aziende.list) {
    return (
      <nav className="breadcrumb" aria-label="Percorso di navigazione">
        <ol>
          <li>
            <span>Tutte le Aziende</span>
          </li>
        </ol>
      </nav>
    )
  }

  return (
    <nav className="breadcrumb" aria-label="Percorso di navigazione">
      <ol>
        {/* Livello 1: Nome del Settore (es. Alimentari) */}
        {settoreId && (
          <li>
            {!params.aziendaId ? (
              <span>{nomeSettore || 'Caricamento...'}</span>
            ) : (
              <Link to={paths.settori.detail(settoreId)}>
                {nomeSettore || 'Settore'}
              </Link>
            )}
          </li>
        )}

        {/* Livello 2: Nome dell'Azienda */}
        {params.aziendaId && (
          <li>
            {!params.personaId ? (
              <span>{nomeAzienda || 'Caricamento...'}</span>
            ) : (
              <Link to={paths.aziende.detail(params.aziendaId)}>
                {nomeAzienda || 'Azienda'}
              </Link>
            )}
          </li>
        )}

        {/* Livello 3: Nome della Persona */}
        {params.personaId && (
          <li>
            {!params.certificatoId ? (
              <span>{nomePersona || 'Caricamento...'}</span>
            ) : (
              <Link to={paths.aziende.persone.detail(params.aziendaId!, params.personaId)}>
                {nomePersona || 'Persona'}
              </Link>
            )}
          </li>
        )}

        {/* Livello 4: Certificato */}
        {params.certificatoId && (
          <li>
            <span>{nomeCertificato || 'Certificato'}</span>
          </li>
        )}
      </ol>
    </nav>
  )
}