import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { paths } from '../../routes/paths'
import { supabase } from '../../lib/supabase/client'
import { isCertificatoInScadenza } from '../../lib/utils/utils'

interface CertificatoScadenza {
  data_scadenza: string | null
}

interface PersonaConCertificati {
  certificati?: CertificatoScadenza[]
}

interface Azienda {
  id: string
  nome: string
  codice_fiscale?: string | null
  p_iva?: string | null
  ateco?: string | null
  persone?: PersonaConCertificati[]
}

export function AziendeListPage() {
  const [aziende, setAziende] = useState<Azienda[]>([])
  const [loading, setLoading] = useState(true)
  const [soloAlert, setSoloAlert] = useState(false)
  const [ricercaTesto, setRicercaTesto] = useState('')
  const [mostraFormAggiungi, setMostraFormAggiungi] = useState(false)
  
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovoCf, setNuovoCf] = useState('')
  const [nuovoPIva, setNuovoPIva] = useState('')
  const [nuovoAteco, setNuovoAteco] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNome, setEditingNome] = useState('')
  const [editingCf, setEditingCf] = useState('')
  const [editingPIva, setEditingPIva] = useState('')
  const [editingAteco, setEditingAteco] = useState('')

  const fetchAziende = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('aziende')
      .select(`
        id,
        nome,
        codice_fiscale,
        p_iva,
        ateco,
        persone (
          certificati (
            data_scadenza
          )
        )
      `)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Errore nel recupero delle aziende:', error)
    } else {
      const formattedData = (data || []).map((item) => ({
        id: String(item.id),
        nome: item.nome,
        codice_fiscale: item.codice_fiscale,
        p_iva: item.p_iva,
        ateco: item.ateco,
        persone: item.persone || [],
      }))
      setAziende(formattedData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAziende()
  }, [])

  const handleAddAzienda = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuovoNome.trim()) return

    const { error } = await supabase
      .from('aziende')
      .insert([
        {
          nome: nuovoNome.trim(),
          codice_fiscale: nuovoCf.trim() || null,
          p_iva: nuovoPIva.trim() || null,
          ateco: nuovoAteco.trim() || null,
        },
      ])

    if (error) {
      console.error('Errore durante l\'inserimento:', error)
    } else {
      setNuovoNome('')
      setNuovoCf('')
      setNuovoPIva('')
      setNuovoAteco('')
      setMostraFormAggiungi(false)
      fetchAziende()
    }
  }

  const handleUpdateAzienda = async (id: string) => {
    if (!editingNome.trim()) return

    const { error } = await supabase
      .from('aziende')
      .update({
        nome: editingNome.trim(),
        codice_fiscale: editingCf.trim() || null,
        p_iva: editingPIva.trim() || null,
        ateco: editingAteco.trim() || null,
      })
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'aggiornamento:', error)
    } else {
      setEditingId(null)
      setEditingNome('')
      setEditingCf('')
      setEditingPIva('')
      setEditingAteco('')
      fetchAziende()
    }
  }

  const handleDeleteAzienda = async (id: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa azienda?')) return

    const { error } = await supabase
      .from('aziende')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Errore durante l\'eliminazione dell\'azienda:', error)
    } else {
      fetchAziende()
    }
  }

  const aziendeFiltrate = aziende.filter((azienda) => {
    const haAlert = azienda.persone?.some((persona) =>
      persona.certificati?.some((cert) => isCertificatoInScadenza(cert.data_scadenza))
    )

    if (soloAlert && !haAlert) return false

    if (ricercaTesto.trim() !== '') {
      const query = ricercaTesto.trim().toLowerCase()
      const matchNome = azienda.nome.toLowerCase().includes(query)
      const matchCf = azienda.codice_fiscale?.toLowerCase().includes(query) || false
      const matchPIva = azienda.p_iva?.toLowerCase().includes(query) || false
      const matchAteco = azienda.ateco?.toLowerCase().includes(query) || false

      if (!matchNome && !matchCf && !matchPIva && !matchAteco) return false
    }

    return true
  })

  if (loading && aziende.length === 0) {
    return <p className="muted" style={{ padding: '2rem', textAlign: 'center' }}>Caricamento aziende...</p>
  }

  return (
    <section className="stack">
      <header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 250px' }}>
          <h2>Aziende</h2>
          <p className="muted">Elenco aziende registrate</p>
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
            {mostraFormAggiungi ? 'Chiudi' : '+ Aggiungi Azienda'}
          </button>
        </div>
      </header>

      <div style={{ margin: '0.5rem 0' }}>
        <input
          type="text"
          placeholder="Cerca azienda per nome, CF, P.IVA o ATECO..."
          value={ricercaTesto}
          onChange={(e) => setRicercaTesto(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {mostraFormAggiungi && (
        <form onSubmit={handleAddAzienda} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
          <h4>Aggiungi Nuova Azienda</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nome azienda..."
              value={nuovoNome}
              onChange={(e) => setNuovoNome(e.target.value)}
              style={{ padding: '0.5rem', flex: 2, borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="C.F."
              value={nuovoCf}
              onChange={(e) => setNuovoCf(e.target.value)}
              style={{ padding: '0.5rem', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="P. IVA"
              value={nuovoPIva}
              onChange={(e) => setNuovoPIva(e.target.value)}
              style={{ padding: '0.5rem', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="ATECO"
              value={nuovoAteco}
              onChange={(e) => setNuovoAteco(e.target.value)}
              style={{ padding: '0.5rem', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Salva Azienda</button>
          </div>
        </form>
      )}

      {aziendeFiltrate.length === 0 ? (
        <EmptyState
          title="Nessuna azienda trovata"
          description="Nessun elemento corrisponde ai filtri o alla ricerca impostata."
        />
      ) : (
        <section className="card-list">
          <ul>
            {aziendeFiltrate.map((azienda) => {
              const haAlert = azienda.persone?.some((persona) =>
                persona.certificati?.some((cert) => isCertificatoInScadenza(cert.data_scadenza))
              )

              return (
                <li key={azienda.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                  {editingId === azienda.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingNome}
                        onChange={(e) => setEditingNome(e.target.value)}
                        placeholder="Nome"
                        style={{ padding: '0.3rem', flex: '2 1 200px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={editingCf}
                        onChange={(e) => setEditingCf(e.target.value)}
                        placeholder="C.F."
                        style={{ padding: '0.3rem', flex: '1 1 130px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={editingPIva}
                        onChange={(e) => setEditingPIva(e.target.value)}
                        placeholder="P. IVA"
                        style={{ padding: '0.3rem', flex: '1 1 130px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={editingAteco}
                        onChange={(e) => setEditingAteco(e.target.value)}
                        placeholder="ATECO"
                        style={{ padding: '0.3rem', flex: '1 1 100px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      
                      <div style={{ display: 'flex', gap: '0.4rem', flexBasis: '100%', marginTop: '0.2rem' }}>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateAzienda(azienda.id)}
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
                      <Link to={paths.aziende.detail(azienda.id)} style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ color: '#0066cc' }}>{azienda.nome}</strong>
                          {haAlert && (
                            <span title="Questa azienda ha dipendenti con certificati in scadenza" style={{ fontSize: '1rem' }}>⚠️</span>
                          )}
                        </div>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>
                          {azienda.codice_fiscale && `CF: ${azienda.codice_fiscale}`}
                          {azienda.p_iva && ` | P.IVA: ${azienda.p_iva}`}
                          {azienda.ateco && ` | ATECO: ${azienda.ateco}`}
                        </span>
                      </Link>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline btn-icon"
                          onClick={() => {
                            setEditingId(azienda.id)
                            setEditingNome(azienda.nome)
                            setEditingCf(azienda.codice_fiscale || '')
                            setEditingPIva(azienda.p_iva || '')
                            setEditingAteco(azienda.ateco || '')
                          }}
                          title="Modifica"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDeleteAzienda(azienda.id)}
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