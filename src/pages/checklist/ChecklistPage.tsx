import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' // <-- Importa useParams
import { supabase } from '../../lib/supabase/client'
import * as XLSX from 'xlsx'

// Tipo per le aziende nel select
interface AziendaOption {
  id: number
  nome: string
}

// Tipo per i macchinari (gestiti nel JSON)
type Macchinario = {
  id: string
  descrizione: string
  marcaturaCee: boolean
  numero: string
}

export function ChecklistPage() {
  const { aziendaId } = useParams<{ aziendaId?: string }>() // <-- Legge l'id dalla rotta dinamica

  const [aziende, setAziende] = useState<AziendaOption[]>([])
  const [selectedAziendaId, setSelectedAziendaId] = useState<number | ''>('')
  const [checklistId, setChecklistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Campi del form basati sulla tabella Supabase
  const [nDipendenti, setNDipendenti] = useState<number | ''>('')
  
  // Documenti
  const [dvr, setDvr] = useState(false)
  const [formazione, setFormazione] = useState(false)
  const [rspp, setRspp] = useState(false)
  const [rls, setRls] = useState(false)
  const [antincendio, setAntincendio] = useState(false)
  const [primoSoccorso, setPrimoSoccorso] = useState(false)
  const [nominaMc, setNominaMc] = useState(false)
  const [pee, setPee] = useState(false)
  const [docAiNote, setDocAiNote] = useState('')

  // Strutturali
  const [superficie, setSuperficie] = useState<number | ''>('')
  const [pianiFt, setPianiFt] = useState<number | ''>('')
  const [interrato, setInterrato] = useState(false)
  const [piazzale, setPiazzale] = useState(false)
  const [segnaletica, setSegnaletica] = useState(false)

  // Verifica Rischi
  const [sostanzePericolose, setSostanzePericolose] = useState(false)
  const [cadutaDallAlto, setCadutaDallAlto] = useState(false)
  const [spaziConfinati, setSpaziConfinati] = useState(false)
  const [rumore, setRumore] = useState(false)
  const [vibrazioni, setVibrazioni] = useState(false)
  const [mmc, setMmc] = useState(false)

  // Macchinari (JSON)
  const [macchinari, setMacchinari] = useState<Macchinario[]>([])

  // 1. Carica l'elenco delle aziende all'avvio e imposta l'azienda se presente nell'URL
  useEffect(() => {
    async function fetchAziende() {
      const { data, error } = await supabase.from('aziende').select('id, nome').order('nome')
      if (error) {
        console.error('Errore nel recupero aziende:', error)
      } else if (data) {
        setAziende(data)
        // Se c'è un aziendaId nei parametri dell'URL, lo impostiamo come selezionato
        if (aziendaId) {
          setSelectedAziendaId(Number(aziendaId))
        }
      }
    }
    fetchAziende()
  }, [aziendaId])

  // 2. Quando cambia l'azienda selezionata, cerca se esiste già una checklist associata
  useEffect(() => {
    if (!selectedAziendaId) {
      resetForm(false)
      return
    }

    async function fetchChecklistAzienda() {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklist')
        .select('*')
        .eq('azienda_id', selectedAziendaId)
        .maybeSingle()

      if (error) {
        console.error('Errore nel recupero della checklist:', error)
      } else if (data) {
        setChecklistId(data.id)
        setNDipendenti(data.n_dipendenti ?? '')
        setDvr(data.dvr ?? false)
        setFormazione(data.formazione ?? false)
        setRspp(data.rspp ?? false)
        setRls(data.rls ?? false)
        setAntincendio(data.antincendio ?? false)
        setPrimoSoccorso(data.primo_soccorso ?? false)
        setNominaMc(data.nomina_mc ?? false)
        setPee(data.pee ?? false)
        setDocAiNote(data.doc_ai_note ?? '')
        
        setSuperficie(data.superficie ?? '')
        setPianiFt(data.piani_ft ?? '')
        setInterrato(data.interrato ?? false)
        setPiazzale(data.piazzale ?? false)
        setSegnaletica(data.segnaletica ?? false)

        setSostanzePericolose(data.sostanze_pericolose ?? false)
        setCadutaDallAlto(data.caduta_dall_alto ?? false)
        setSpaziConfinati(data.spazi_confinati ?? false)
        setRumore(data.rumore ?? false)
        setVibrazioni(data.vibrazioni ?? false)
        setMmc(data.mmc ?? false)

        setMacchinari(Array.isArray(data.macchinari) ? data.macchinari : [])
      } else {
        resetForm(false)
      }
      setLoading(false)
    }

    fetchChecklistAzienda()
  }, [selectedAziendaId])

  const resetForm = (clearAzienda = true) => {
    if (clearAzienda) setSelectedAziendaId('')
    setChecklistId(null)
    setNDipendenti('')
    setDvr(false)
    setFormazione(false)
    setRspp(false)
    setRls(false)
    setAntincendio(false)
    setPrimoSoccorso(false)
    setNominaMc(false)
    setPee(false)
    setDocAiNote('')
    setSuperficie('')
    setPianiFt('')
    setInterrato(false)
    setPiazzale(false)
    setSegnaletica(false)
    setSostanzePericolose(false)
    setCadutaDallAlto(false)
    setSpaziConfinati(false)
    setRumore(false)
    setVibrazioni(false)
    setMmc(false)
    setMacchinari([])
  }

  // Gestione righe macchinari dinamici
  const aggiungiMacchinario = () => {
    setMacchinari([
      ...macchinari,
      { id: Date.now().toString(), descrizione: '', marcaturaCee: true, numero: '' }
    ])
  }

  const rimuoviMacchinario = (id: string) => {
    setMacchinari(macchinari.filter(m => m.id !== id))
  }

  const aggiornaMacchinario = (id: string, campo: keyof Macchinario, valore: any) => {
    setMacchinari(macchinari.map(m => m.id === id ? { ...m, [campo]: valore } : m))
  }

  // Salvataggio su Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAziendaId) {
      alert("Seleziona prima un'azienda.")
      return
    }

    setSaving(true)

    const payload = {
      azienda_id: Number(selectedAziendaId),
      n_dipendenti: nDipendenti === '' ? null : Number(nDipendenti),
      dvr,
      formazione,
      rspp,
      rls,
      antincendio,
      primo_soccorso: primoSoccorso,
      nomina_mc: nominaMc,
      pee,
      doc_ai_note: docAiNote.trim() || null,
      superficie: superficie === '' ? null : Number(superficie),
      piani_ft: pianiFt === '' ? null : Number(pianiFt),
      interrato,
      piazzale,
      segnaletica,
      sostanze_pericolose: sostanzePericolose,
      caduta_dall_alto: cadutaDallAlto,
      spazi_confinati: spaziConfinati,
      rumore,
      vibrazioni,
      mmc,
      macchinari,
      updated_at: new Date().toISOString()
    }

    let error = null

    if (checklistId) {
      const res = await supabase.from('checklist').update(payload).eq('id', checklistId)
      error = res.error
    } else {
      const res = await supabase.from('checklist').insert([payload]).select('id').single()
      if (res.data) setChecklistId(res.data.id)
      error = res.error
    }

    setSaving(false)

    if (error) {
      console.error("Errore durante il salvataggio della checklist:", error)
      alert("Errore durante il salvataggio.")
    } else {
      alert("Checklist salvata con successo!")
    }
  }

  // Eliminazione della checklist dal database
  const handleDelete = async () => {
    if (!checklistId) {
      alert("Nessuna checklist salvata da eliminare per questa azienda.")
      return
    }

    const conferma = window.confirm("Sei sicuro di voler eliminare definitivamente questa checklist dal database?")
    if (!conferma) return

    setDeleting(true)

    const { error } = await supabase
      .from('checklist')
      .delete()
      .eq('id', checklistId)

    setDeleting(false)

    if (error) {
      console.error("Errore durante l'eliminazione:", error)
      alert("Errore durante l'eliminazione della checklist.")
    } else {
      alert("Checklist eliminata con successo!")
      resetForm(false) // Pulisce i campi ma mantiene l'azienda selezionata
    }
  }

  // Funzione per l'export in vero Excel (.xlsx) formattato
  const handleExportExcel = () => {
    if (!selectedAziendaId) {
      alert("Seleziona prima un'azienda.")
      return
    }

    const aziendaCorrente = aziende.find(a => a.id === selectedAziendaId)?.nome || 'Azienda'

    const rows: (string | number)[][] = [
      [`CHECKLIST AZIENDALE: ${aziendaCorrente.toUpperCase()}`],
      [], 
      ['Documenti', 'N. Dipendenti', nDipendenti !== '' ? nDipendenti : 0],
      ['Documenti', 'D.V.R. (Documento Valutazione Rischi)', dvr ? 'SI' : 'NO'],
      ['Documenti', 'Formazione Lavoratori', formazione ? 'SI' : 'NO'],
      ['Documenti', 'R.S.P.P. (Responsabile Servizio Prev. Protezione)', rspp ? 'SI' : 'NO'],
      ['Documenti', 'R.L.S. (Rappresentante Lavoratori Sicurezza)', rls ? 'SI' : 'NO'],
      ['Documenti', 'Antincendio (A.I.)', antincendio ? 'SI' : 'NO'],
      ['Documenti', 'Primo Soccorso', primoSoccorso ? 'SI' : 'NO'],
      ['Documenti', 'Nomina Medico Competente (M.C.)', nominaMc ? 'SI' : 'NO'],
      ['Documenti', 'P.E.E. (Piano Emergenza ed Evacuazione)', pee ? 'SI' : 'NO'],
      ['Documenti', 'Note Antincendio', docAiNote || '-'],
      [], 
      ['Strutturali', 'Superficie (MQ)', superficie !== '' ? superficie : 0],
      ['Strutturali', 'Piani Fuori Terra', pianiFt !== '' ? pianiFt : 0],
      ['Strutturali', 'Presenza Interrato', interrato ? 'SI' : 'NO'],
      ['Strutturali', 'Presenza Piazzale Esterno', piazzale ? 'SI' : 'NO'],
      ['Strutturali', 'Segnaletica di Sicurezza', segnaletica ? 'SI' : 'NO'],
      [], 
      ['Verifica Rischi', 'Sostanze Pericolose', sostanzePericolose ? 'SI' : 'NO'],
      ['Verifica Rischi', 'Caduta dall\'alto', cadutaDallAlto ? 'SI' : 'NO'],
      ['Verifica Rischi', 'Spazi Confinati', spaziConfinati ? 'SI' : 'NO'],
      ['Verifica Rischi', 'Rischio Rumore', rumore ? 'SI' : 'NO'],
      ['Verifica Rischi', 'Rischio Vibrazioni', vibrazioni ? 'SI' : 'NO'],
      ['Verifica Rischi', 'Movimentazione Manuale Carichi (M.M.C.)', mmc ? 'SI' : 'NO'],
      [], 
      ['MACCHINE E ATTREZZATURE CENSITE'],
      ['N°', 'DESCRIZIONE MACCHINA / ATTREZZATURA', 'MARCATURA CEE', 'QUANTITÀ / NUMERO']
    ]

    if (macchinari.length === 0) {
      rows.push(['-', 'Nessun macchinario inserito', '-', '-'])
    } else {
      macchinari.forEach((m, idx) => {
        rows.push([
          idx + 1,
          m.descrizione || 'Senza descrizione',
          m.marcaturaCee ? 'SI' : 'NO',
          m.numero || '-'
        ])
      })
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows)

    worksheet['!cols'] = [
      { wch: 20 }, 
      { wch: 45 }, 
      { wch: 18 }, 
      { wch: 18 }  
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklist Sicurezza')

    XLSX.writeFile(workbook, `Checklist_${aziendaCorrente.replace(/\s+/g, '_')}.xlsx`)
  }

  return (
    <section className="stack">
      <header className="section-header" style={{ marginBottom: '1rem' }}>
        <h2>Checklist Aziendale</h2>
        <p className="muted">Verifica e compila i dati di sicurezza, strutturali e le attrezzature.</p>
      </header>

      {/* Selezione Azienda */}
      <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #ddd' }}>
        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.4rem' }}>Seleziona Azienda:</label>
        <select
          value={selectedAziendaId}
          onChange={(e) => setSelectedAziendaId(e.target.value ? Number(e.target.value) : '')}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">-- Scegli un'azienda --</option>
          {aziende.map(az => (
            <option key={az.id} value={az.id}>{az.nome}</option>
          ))}
        </select>
      </div>

      {loading && <p className="muted">Caricamento dati checklist...</p>}

      {selectedAziendaId && !loading && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SEZIONE 1: DOCUMENTI */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h3>Documenti</h3>
            
            <div style={{ margin: '1rem 0' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>N. Dipendenti</label>
              <input
                type="number"
                value={nDipendenti}
                onChange={(e) => setNDipendenti(e.target.value ? Number(e.target.value) : '')}
                style={{ padding: '0.4rem', width: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={dvr} onChange={(e) => setDvr(e.target.checked)} /> D.V.R.
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formazione} onChange={(e) => setFormazione(e.target.checked)} /> Formazione
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={rspp} onChange={(e) => setRspp(e.target.checked)} /> R.S.P.P.
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={rls} onChange={(e) => setRls(e.target.checked)} /> R.L.S.
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={antincendio} onChange={(e) => setAntincendio(e.target.checked)} /> A.I. (Antincendio)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={primoSoccorso} onChange={(e) => setPrimoSoccorso(e.target.checked)} /> 1° Soccorso
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={nominaMc} onChange={(e) => setNominaMc(e.target.checked)} /> Nomina M.C.
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={pee} onChange={(e) => setPee(e.target.checked)} /> P.E.E.
              </label>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Note Doc. A.I. (es. Impianto esterno, sprinkler)</label>
              <input
                type="text"
                value={docAiNote}
                onChange={(e) => setDocAiNote(e.target.value)}
                placeholder="Dettagli impianto antincendio..."
                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          {/* SEZIONE 2: STRUTTURALI */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h3>Strutturali</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Superficie (MQ)</label>
                <input
                  type="number"
                  value={superficie}
                  onChange={(e) => setSuperficie(e.target.value ? Number(e.target.value) : '')}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Piani Fuori Terra</label>
                <input
                  type="number"
                  value={pianiFt}
                  onChange={(e) => setPianiFt(e.target.value ? Number(e.target.value) : '')}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={interrato} onChange={(e) => setInterrato(e.target.checked)} /> Interrato
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={piazzale} onChange={(e) => setPiazzale(e.target.checked)} /> Piazzale
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={segnaletica} onChange={(e) => setSegnaletica(e.target.checked)} /> Segnaletica
              </label>
            </div>
          </div>

          {/* SEZIONE 3: MACCHINE E ATTREZZATURE (DINAMICA JSON) */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '6px', border: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Macchine e Attrezzature</h3>
              <button
                type="button"
                onClick={aggiungiMacchinario}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
              >
                + Aggiungi Macchina
              </button>
            </div>

            {macchinari.length === 0 ? (
              <p className="muted" style={{ fontStyle: 'italic' }}>Nessun macchinario censito per questa azienda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {macchinari.map((m, index) => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#f9f9f9', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                    
                    {/* Prima riga: Numero, Descrizione e Pulsante Elimina */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{index + 1}.</span>
                      <input
                        type="text"
                        placeholder="Descrizione macchinario..."
                        value={m.descrizione}
                        onChange={(e) => aggiornaMacchinario(m.id, 'descrizione', e.target.value)}
                        style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <button
                        type="button"
                        onClick={() => rimuoviMacchinario(m.id)}
                        className="btn btn-danger btn-icon"
                        title="Elimina"
                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Seconda riga: Marcatura CEE e Campo Numero (andati a capo) */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', paddingLeft: '1.5rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={m.marcaturaCee}
                          onChange={(e) => aggiornaMacchinario(m.id, 'marcaturaCee', e.target.checked)}
                        />
                        Marcatura CEE
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#555' }}>N°:</span>
                        <input
                          type="text"
                          placeholder="Quantità / Numero"
                          value={m.numero}
                          onChange={(e) => aggiornaMacchinario(m.id, 'numero', e.target.value)}
                          style={{ width: '120px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEZIONE 4: VERIFICA RISCHI */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '6px', border: '1px solid #ddd' }}>
            <h3>Verifica Rischi</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={sostanzePericolose} onChange={(e) => setSostanzePericolose(e.target.checked)} /> Sostanze Pericolose
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={cadutaDallAlto} onChange={(e) => setCadutaDallAlto(e.target.checked)} /> Caduta dall'alto
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={spaziConfinati} onChange={(e) => setSpaziConfinati(e.target.checked)} /> Spazi Confinati
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={rumore} onChange={(e) => setRumore(e.target.checked)} /> Rumore
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={vibrazioni} onChange={(e) => setVibrazioni(e.target.checked)} /> Vibrazioni
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked= {mmc} onChange={(e) => setMmc(e.target.checked)} /> M.M.C.
              </label>
            </div>
          </div>

          {/* BOTTONI COMPatti (Salva, Esporta, Elimina vicini) */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              style={{ 
                padding: '0.6rem 1.2rem', 
                fontSize: '0.95rem', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                background: '#16a34a', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px' 
              }}
            >
                Esporta
            </button>

            {checklistId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  fontSize: '0.95rem', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  background: '#dc2626', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '6px' 
                }}
              >
                {deleting ? 'Eliminazione...' : 'Elimina'}
              </button>
            )}
          </div>

        </form>
      )}
    </section>
  )
}