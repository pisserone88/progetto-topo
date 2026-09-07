import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { paths } from '../../routes/paths'
import { supabase } from '../../lib/supabase/client'
import { isCertificatoInScadenza } from '../../lib/utils/utils'

interface CertificatoScadenza {
  data_scadenza: string | null
}

interface Persona {
  id: string
  nome: string
  cognome: string
  codice_fiscale?: string | null
  data_nascita?: string | null
  luogo_nascita?: string | null
  certificati?: CertificatoScadenza[]
}

export function AziendaDetailPage() {
  const { aziendaId = '' } = useParams<{ aziendaId: string }>()
  const [persone, setPersone] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [nomeAzienda, setNomeAzienda] = useState<string>('')
  
  const [soloAlert, setSoloAlert] = useState(false)
  const [ricercaTesto, setRicercaTesto] = useState('')
  const [mostraFormAggiungi, setMostraFormAggiungi] = useState(false)
  
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovoCognome, setNuovoCognome] = useState('')
  const [nuovoCf, setNuovoCf] = useState('')
  const [nuovaDataNascita, setNuovaDataNascita] = useState('')
  const [nuovoLuogoNascita, setNewLuogoNascita] = useState('')
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNome, setEditingNome] = useState('')
  const [editingCognome, setEditingCognome] = useState('')
  const [editingCf, setEditingCf] = useState('')
  const [editingDataNascita, setEditingDataNascita] = useState('')
  const [editingLuogoNascita, setEditingLuogoNascita] = useState('')

  const fetchPersoneData = async () => {
    if (!aziendaId) return
    setLoading(true)

    const { data: aziendaData } = await supabase
      .from('aziende')
      .select('nome')
      .eq('id', aziendaId)
      .single()

    if (aziendaData) {
      setNomeAzienda(aziendaData.nome)
    }

    const { data, error } = await supabase
      .from('persone')
      .select(`
        id,
        nome,
        cognome,
        codice_fiscale,
        data_nascita,
        luogo_nascita,
        certificati (
          data_scadenza
        )
      `)
      .eq('azienda_id', aziendaId)
      .order('cognome', { ascending: true })

    if (error) {
      console.error('Errore nel recupero delle persone:', error)
    } else {
      const formattedData = (data || []).map((item) => ({
        id: String(item.id),
        nome: item.nome,
        cognome: item.cognome,
        codice_fiscale: item.codice_fiscale,
        data_nascita: item.data_nascita,
        luogo_nascita: item.luogo_nascita,
        certificati: item.certificati || [],
      }))
      setPersone(formattedData)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchPersoneData()
  }, [aziendaId])

  const handleAddPersona = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuovoNome.trim() || !nuovoCognome.trim()) return

    const { error } = await supabase
      .from('persone')
      .insert([
        {
          azienda_id: aziendaId,
          nome: nuovoNome.trim(),
          cognome: nuovoCognome.trim(),
          codice_fiscale: nuovoCf.trim() || null,
          data_nascita: nuovaDataNascita || null,
          luogo_nascita: nuovoLuogoNascita.trim() || null,
        },
      ])

    if (error) {
      console.error('Errore durante l\'inserimento della persona:', error)
    } else {
      setNuovoNome('')
      setNuovoCognome('')
      setNuovoCf('')
      setNuovaDataNascita('')
      setNewLuogoNascita('')
      setMostraFormAggiungi(false)
      fetchPersoneData()
    }
  }

  const handleUpdatePersona = async (id: string) => {
    if (!editingNome.trim() || !editingCognome.trim()) return

    const { error } = await supabase
      .from('persone')
      .update({
        nome: editingNome.trim(),
        cognome: editingCognome.trim(),
        codice_fiscale: editingCf.trim() || null,
        data_nascita: editingDataNascita || null,
        luogo_nascita: editingLuogoNascita.trim() || null,
      })
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'aggiornamento della persona:', error)
    } else {
      setEditingId(null)
      setEditingNome('')
      setEditingCognome('')
      setEditingCf('')
      setEditingDataNascita('')
      setEditingLuogoNascita('')
      fetchPersoneData()
    }
  }

  const handleDeletePersona = async (id: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa persona? Verranno eliminati anche i suoi certificati.')) return

    const { error } = await supabase
      .from('persone')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'eliminazione della persona:', error)
    } else {
      fetchPersoneData()
    }
  }

  const personeFiltrate = persone.filter((persona) => {
    const haAlert = persona.certificati?.some((c) => isCertificatoInScadenza(c.data_scadenza))

    if (soloAlert && !haAlert) return false

    if (ricercaTesto.trim() !== '') {
      const query = ricercaTesto.trim().toLowerCase()
      const matchNome = persona.nome.toLowerCase().includes(query)
      const matchCognome = persona.cognome.toLowerCase().includes(query)
      const matchCf = persona.codice_fiscale?.toLowerCase().includes(query) || false
      const matchLuogo = persona.luogo_nascita?.toLowerCase().includes(query) || false
      const matchData = persona.data_nascita?.toLowerCase().includes(query) || false

      if (!matchNome && !matchCognome && !matchCf && !matchLuogo && !matchData) return false
    }

    return true
  })

  if (loading && persone.length === 0) {
    return <p className="muted" style={{ padding: '2rem', textAlign: 'center' }}>Caricamento persone...</p>
  }

  return (
    <section className="stack">
      <header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 250px', minWidth: 0 }}>
          <h2>{nomeAzienda || `Azienda #${aziendaId}`}</h2>
          <p className="muted">Elenco dipendenti registrati</p>
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
            {mostraFormAggiungi ? 'Chiudi' : '+ Aggiungi Persona'}
          </button>
        </div>
      </header>

      <div style={{ margin: '0.5rem 0' }}>
        <input
          type="text"
          placeholder="Cerca dipendente per nome, cognome, CF o luogo di nascita..."
          value={ricercaTesto}
          onChange={(e) => setRicercaTesto(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {mostraFormAggiungi && (
        <form onSubmit={handleAddPersona} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
          <h4>Aggiungi Nuova Persona</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Cognome</label>
            <input
              type="text"
              placeholder="Inserisci cognome..."
              value={nuovoCognome}
              onChange={(e) => setNuovoCognome(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Nome</label>
            <input
              type="text"
              placeholder="Inserisci nome..."
              value={nuovoNome}
              onChange={(e) => setNuovoNome(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Codice Fiscale</label>
            <input
              type="text"
              placeholder="Inserisci codice fiscale..."
              value={nuovoCf}
              onChange={(e) => setNuovoCf(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Data di Nascita</label>
            <input
              type="date"
              value={nuovaDataNascita}
              onChange={(e) => setNuovaDataNascita(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }} className="muted">Luogo di Nascita</label>
            <input
              type="text"
              placeholder="Inserisci luogo di nascita..."
              value={nuovoLuogoNascita}
              onChange={(e) => setNewLuogoNascita(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginTop: '0.25rem' }}>Salva Persona</button>
          </div>
        </form>
      )}

      {personeFiltrate.length === 0 ? (
        <EmptyState
          title="Nessuna persona trovata"
          description="Nessun elemento corrisponde ai filtri o alla ricerca impostata."
        />
      ) : (
        <section className="card-list">
          <ul>
            {personeFiltrate.map((persona) => {
              const haAlert = persona.certificati?.some((c) => isCertificatoInScadenza(c.data_scadenza))

              return (
                <li key={persona.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                  {editingId === persona.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingCognome}
                        onChange={(e) => setEditingCognome(e.target.value)}
                        placeholder="Cognome"
                        style={{ padding: '0.3rem', flex: '1 1 120px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={editingNome}
                        onChange={(e) => setEditingNome(e.target.value)}
                        placeholder="Nome"
                        style={{ padding: '0.3rem', flex: '1 1 120px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={editingCf}
                        onChange={(e) => setEditingCf(e.target.value)}
                        placeholder="Codice Fiscale"
                        style={{ padding: '0.3rem', flex: '1 1 130px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="date"
                        value={editingDataNascita}
                        onChange={(e) => setEditingDataNascita(e.target.value)}
                        style={{ padding: '0.3rem', flex: '1 1 110px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={editingLuogoNascita}
                        onChange={(e) => setEditingLuogoNascita(e.target.value)}
                        placeholder="Luogo di Nascita"
                        style={{ padding: '0.3rem', flex: '1 1 120px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      
                      <div style={{ display: 'flex', gap: '0.4rem', flexBasis: '100%', marginTop: '0.2rem' }}>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          onClick={() => handleUpdatePersona(persona.id)}
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
                    </div>
                  ) : (
                    <>
                      <Link to={paths.aziende.persone.detail(aziendaId, persona.id)} style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div>
                            <strong>{persona.cognome}</strong> {persona.nome}
                          </div>
                          {haAlert && (
                            <span title="Questa persona ha certificati in scadenza" style={{ fontSize: '1rem' }}>⚠️</span>
                          )}
                        </div>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>
                          {persona.codice_fiscale && `CF: ${persona.codice_fiscale}`}
                          {persona.data_nascita && ` | Nato/a il: ${persona.data_nascita}`}
                          {persona.luogo_nascita && ` a ${persona.luogo_nascita}`}
                        </span>
                      </Link>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline btn-icon"
                          onClick={() => {
                            setEditingId(persona.id)
                            setEditingNome(persona.nome)
                            setEditingCognome(persona.cognome)
                            setEditingCf(persona.codice_fiscale || '')
                            setEditingDataNascita(persona.data_nascita || '')
                            setEditingLuogoNascita(persona.luogo_nascita || '')
                          }}
                          title="Modifica"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDeletePersona(persona.id)}
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