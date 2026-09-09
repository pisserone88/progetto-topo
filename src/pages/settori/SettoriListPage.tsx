import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { supabase } from '../../lib/supabase/client'
import { isCertificatoInScadenza } from '../../lib/utils/utils'

interface CertificatoScadenza {
  data_scadenza: string | null
}

interface PersonaConCertificati {
  certificati?: CertificatoScadenza[]
}

interface AziendaConPersone {
  id: string
  persone?: PersonaConCertificati[]
}

interface Settore {
  id: string
  nome: string
  aziende?: AziendaConPersone[]
}

export function SettoriListPage() {
  const [settori, setSettori] = useState<Settore[]>([])
  const [loading, setLoading] = useState(true)
  const [ricercaTesto, setRicercaTesto] = useState('')
  const [mostraFormAggiungi, setMostraFormAggiungi] = useState(false)
  const [nuovoNome, setNuovoNome] = useState('')
  const [soloAlert, setSoloAlert] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNome, setEditingNome] = useState('')

  const fetchSettori = async () => {
    setLoading(true)
    // Recuperiamo i settori insieme alle aziende, persone e certificati collegati
    // per poter calcolare a cascata la presenza di scadenze
    const { data, error } = await supabase
      .from('settori')
      .select(`
        id,
        nome,
        aziende (
          id,
          persone (
            certificati (
              data_scadenza
            )
          )
        )
      `)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Errore nel recupero dei settori:', error)
    } else {
      setSettori((data || []).map(s => ({ 
        id: String(s.id), 
        nome: s.nome,
        aziende: s.aziende 
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSettori()
  }, [])

  const handleAddSettore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuovoNome.trim()) return

    const { error } = await supabase
      .from('settori')
      .insert([{ nome: nuovoNome.trim() }])

    if (error) {
      console.error('Errore durante l\'inserimento del settore:', error)
    } else {
      setNuovoNome('')
      setMostraFormAggiungi(false)
      fetchSettori()
    }
  }

  const handleUpdateSettore = async (id: string) => {
    if (!editingNome.trim()) return

    const { error } = await supabase
      .from('settori')
      .update({ nome: editingNome.trim() })
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'aggiornamento del settore:', error)
    } else {
      setEditingId(null)
      fetchSettori()
    }
  }

  const handleDeleteSettore = async (id: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo settore? Le aziende collegate rimarranno senza settore.')) return

    const { error } = await supabase
      .from('settori')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'eliminazione del settore:', error)
    } else {
      fetchSettori()
    }
  }

  // Funzione di supporto per verificare se un settore ha almeno un alert attivo
  const settoreHaAlert = (settore: Settore) => {
    return settore.aziende?.some((azienda) =>
      azienda.persone?.some((persona) =>
        persona.certificati?.some((cert) => isCertificatoInScadenza(cert.data_scadenza))
      )
    )
  }

  const settoriFiltrati = settori.filter((settore) => {
    const matchTesto = settore.nome.toLowerCase().includes(ricercaTesto.trim().toLowerCase())
    if (!matchTesto) return false

    if (soloAlert && !settoreHaAlert(settore)) {
      return false
    }

    return true
  })

  if (loading && settori.length === 0) {
    return <p className="muted" style={{ padding: '2rem', textAlign: 'center' }}>Caricamento settori...</p>
  }

  return (
    <section className="stack">
      <header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 250px' }}>
          <h2>Settori</h2>
          <p className="muted">Elenco delle cartelle di settore</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSoloAlert(!soloAlert)}
            style={{ 
              padding: '0.4rem 0.8rem', 
              cursor: 'pointer', 
              background: soloAlert ? '#fffae6' : 'white', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {soloAlert ? '⚠️ Mostra Tutti' : '⚠️ Mostra solo alert'}
          </button>
          <button 
            onClick={() => setMostraFormAggiungi(!mostraFormAggiungi)}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
          >
            {mostraFormAggiungi ? 'Chiudi' : '+ Aggiungi Settore'}
          </button>
        </div>
      </header>

      <div style={{ margin: '0.5rem 0' }}>
        <input
          type="text"
          placeholder="Cerca settore per nome..."
          value={ricercaTesto}
          onChange={(e) => setRicercaTesto(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {mostraFormAggiungi && (
        <form onSubmit={handleAddSettore} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
          <h4>Aggiungi Nuovo Settore</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Nome settore (es. Metalmeccanico, Servizi...)"
              value={nuovoNome}
              onChange={(e) => setNuovoNome(e.target.value)}
              style={{ padding: '0.5rem', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Salva Settore</button>
          </div>
        </form>
      )}

      {settoriFiltrati.length === 0 ? (
        <EmptyState
          title="Nessun settore trovato"
          description="Nessun elemento corrisponde ai filtri o alla ricerca impostata."
        />
      ) : (
        <section className="card-list">
          <ul>
            {settoriFiltrati.map((settore) => {
              const haAlert = settoreHaAlert(settore)

              return (
                <li key={settore.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid #eee' }}>
                  {editingId === settore.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingNome}
                        onChange={(e) => setEditingNome(e.target.value)}
                        style={{ padding: '0.4rem', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => handleUpdateSettore(settore.id)}
                      >
                        Salva
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => setEditingId(null)}
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link to={`/settori/${settore.id}/aziende`} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                        <span style={{ fontSize: '1.2rem' }}>📁</span>
                        <span style={{ color: '#0066cc', fontSize: '1.05rem' }}>{settore.nome}</span>
                        {haAlert && (
                          <span title="Questo settore contiene aziende con certificati in scadenza" style={{ fontSize: '1rem' }}>⚠️</span>
                        )}
                      </Link>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline btn-icon"
                          onClick={() => {
                            setEditingId(settore.id)
                            setEditingNome(settore.nome)
                          }}
                          title="Modifica"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDeleteSettore(settore.id)}
                          title="Elimina"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </section>
  )
}