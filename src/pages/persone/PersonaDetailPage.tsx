import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { supabase } from '../../lib/supabase/client'
import { isCertificatoInScadenza } from '../../lib/utils/utils'

interface Certificato {
  id: string
  titolo: string
  data_rilascio?: string | null
  data_scadenza?: string | null
}

interface Persona {
  nome: string
  cognome: string
}

export function PersonaDetailPage() {
  const { personaId = '' } = useParams<{
    aziendaId?: string
    personaId: string
  }>()

  const [certificati, setCertificati] = useState<Certificato[]>([])
  const [persona, setPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)

  const [soloAlert, setSoloAlert] = useState(false)
  const [ricercaTesto, setRicercaTesto] = useState('')
  const [mostraFormAggiungi, setMostraFormAggiungi] = useState(false)

  const [nuovoTitolo, setNuovoTitolo] = useState('')
  const [nuovaDataRilascio, setNuovaDataRilascio] = useState('')
  const [nuovaDataScadenza, setNuovaDataScadenza] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitolo, setEditingTitolo] = useState('')
  const [editingDataRilascio, setEditingDataRilascio] = useState('')
  const [editingDataScadenza, setEditingDataScadenza] = useState('')

  const haCertificatiInScadenza = certificati.some((c) => isCertificatoInScadenza(c.data_scadenza ?? null))

  const fetchCertificatiData = async () => {
    if (!personaId) return
    setLoading(true)

    const { data: personaData } = await supabase
      .from('persone')
      .select('nome, cognome')
      .eq('id', personaId)
      .single()

    if (personaData) {
      setPersona(personaData)
    }

    const { data, error } = await supabase
      .from('certificati')
      .select('*')
      .eq('persona_id', personaId)
      .order('titolo', { ascending: true })

    if (error) {
      console.error('Errore nel recupero dei certificati:', error)
    } else {
      const formattedData = (data || []).map((item) => ({
        id: String(item.id),
        titolo: item.titolo,
        data_rilascio: item.data_rilascio,
        data_scadenza: item.data_scadenza,
      }))
      setCertificati(formattedData)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchCertificatiData()
  }, [personaId])

  const handleAddCertificato = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuovoTitolo.trim()) return

    const { error } = await supabase
      .from('certificati')
      .insert([
        {
          persona_id: personaId,
          titolo: nuovoTitolo.trim(),
          data_rilascio: nuovaDataRilascio || null,
          data_scadenza: nuovaDataScadenza || null,
        },
      ])

    if (error) {
      console.error('Errore durante l\'inserimento del certificato:', error)
    } else {
      setNuovoTitolo('')
      setNuovaDataRilascio('')
      setNuovaDataScadenza('')
      setMostraFormAggiungi(false)
      fetchCertificatiData()
    }
  }

  const handleUpdateCertificato = async (id: string) => {
    if (!editingTitolo.trim()) return

    const { error } = await supabase
      .from('certificati')
      .update({
        titolo: editingTitolo.trim(),
        data_rilascio: editingDataRilascio || null,
        data_scadenza: editingDataScadenza || null,
      })
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'aggiornamento del certificato:', error)
    } else {
      setEditingId(null)
      setEditingTitolo('')
      setEditingDataRilascio('')
      setEditingDataScadenza('')
      fetchCertificatiData()
    }
  }

  const handleDeleteCertificato = async (id: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo certificato?')) return

    const { error } = await supabase
      .from('certificati')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'eliminazione del certificato:', error)
    } else {
      fetchCertificatiData()
    }
  }

  const certificatiFiltrati = certificati.filter((certificato) => {
    const inScadenza = isCertificatoInScadenza(certificato.data_scadenza ?? null)
    
    if (soloAlert && !inScadenza) return false

    if (ricercaTesto.trim() !== '') {
      const matchTitolo = certificato.titolo.toLowerCase().includes(ricercaTesto.trim().toLowerCase())
      if (!matchTitolo) return false
    }

    return true
  })

  if (loading && certificati.length === 0) {
    return <p className="muted" style={{ padding: '2rem', textAlign: 'center' }}>Caricamento certificati...</p>
  }

  return (
    <section className="stack">
      <header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 250px', minWidth: 0 }}>
          <h2>
            {persona ? `${persona.nome} ${persona.cognome}` : `Persona #${personaId}`}
            {haCertificatiInScadenza && (
              <span title="Certificati in scadenza" style={{ marginLeft: '0.5rem', fontSize: '1.2rem' }}>⚠️</span>
            )}
          </h2>
          <p className="muted">Elenco certificati e attestati formativi</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSoloAlert(!soloAlert)}
            style={{ 
              padding: '0.4rem 0.8rem', 
              cursor: 'pointer', 
              background: soloAlert ? '#fffae6' : 'white', 
              border: '1px solid #ccc' 
            }}
          >
            {soloAlert ? '⚠️ Mostra Tutti' : '⚠️ Mostra solo alert'}
          </button>
          <button 
            onClick={() => setMostraFormAggiungi(!mostraFormAggiungi)}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
          >
            {mostraFormAggiungi ? 'Chiudi' : '+ Aggiungi Certificato'}
          </button>
        </div>
      </header>

      <div style={{ margin: '0.5rem 0' }}>
        <input
          type="text"
          placeholder="Cerca certificato per nome..."
          value={ricercaTesto}
          onChange={(e) => setRicercaTesto(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {mostraFormAggiungi && (
        <form onSubmit={handleAddCertificato} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
          <h4>Aggiungi Nuovo Certificato</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Titolo Attestato</label>
            <input
              type="text"
              placeholder="Inserisci titolo..."
              value={nuovoTitolo}
              onChange={(e) => setNuovoTitolo(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Data Rilascio</label>
            <input
              type="date"
              value={nuovaDataRilascio}
              onChange={(e) => setNuovaDataRilascio(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Data Scadenza</label>
            <input
              type="date"
              value={nuovaDataScadenza}
              onChange={(e) => setNuovaDataScadenza(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginTop: '0.25rem' }}>Salva Certificato</button>
          </div>
        </form>
      )}

      {certificatiFiltrati.length === 0 ? (
        <EmptyState
          title="Nessun certificato trovato"
          description="Nessun elemento corrisponde ai filtri o alla ricerca impostata."
        />
      ) : (
        <section className="card-list">
          <ul>
            {certificatiFiltrati.map((certificato) => {
              const inScadenza = isCertificatoInScadenza(certificato.data_scadenza ?? null)

              return (
                <li key={certificato.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                  {editingId === certificato.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingTitolo}
                        onChange={(e) => setEditingTitolo(e.target.value)}
                        placeholder="Titolo"
                        style={{ padding: '0.3rem', flex: '2 1 200px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flex: '1 1 130px' }}>
                        <span className="muted" style={{ fontSize: '0.8rem' }}>Rilascio:</span>
                        <input
                          type="date"
                          value={editingDataRilascio}
                          onChange={(e) => setEditingDataRilascio(e.target.value)}
                          style={{ padding: '0.3rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flex: '1 1 130px' }}>
                        <span className="muted" style={{ fontSize: '0.8rem' }}>Scadenza:</span>
                        <input
                          type="date"
                          value={editingDataScadenza}
                          onChange={(e) => setEditingDataScadenza(e.target.value)}
                          style={{ padding: '0.3rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.4rem', flexBasis: '100%', marginTop: '0.2rem' }}>
                        <button 
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleUpdateCertificato(certificato.id)} 
                          style={{ cursor: 'pointer' }}
                        >
                          Salva
                        </button>
                        <button 
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setEditingId(null)} 
                          style={{ cursor: 'pointer' }}
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong>{certificato.titolo}</strong>
                          {inScadenza && (
                            <span title="Questo certificato è in scadenza o scaduto" style={{ fontSize: '1rem' }}>⚠️</span>
                          )}
                        </div>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>
                          {certificato.data_rilascio && `Rilascio: ${certificato.data_rilascio}`}
                          {certificato.data_rilascio && certificato.data_scadenza && ' | '}
                          {certificato.data_scadenza && `Scadenza: ${certificato.data_scadenza}`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline btn-icon"
                          onClick={() => {
                            setEditingId(certificato.id)
                            setEditingTitolo(certificato.titolo)
                            setEditingDataRilascio(certificato.data_rilascio || '')
                            setEditingDataScadenza(certificato.data_scadenza || '')
                          }}
                          title="Modifica"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDeleteCertificato(certificato.id)}
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