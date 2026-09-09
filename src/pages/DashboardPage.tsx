import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase/client'
import { isCertificatoInScadenza } from '../lib/utils/utils'
import { paths } from '../routes/paths'

interface CertificatoUrgente {
  id: string
  titolo: string
  data_scadenza: string | null
  persona: {
    id: string
    nome: string
    cognome: string
    azienda_id: string
    azienda: {
      id: string
      nome: string
    }
  } | null
}

// Funzione rapida per convertire da AAAA-MM-GG a GG/MM/AAAA
const formatDataItaliana = (dataString: string | null) => {
  if (!dataString) return ''
  const [anno, mese, giorno] = dataString.split('-')
  if (!anno || !mese || !giorno) return dataString
  return `${giorno}/${mese}/${anno}`
}

export function DashboardPage() {
  const [totali, setTotali] = useState({
    aziende: 0,
    persone: 0,
    certificati: 0,
    inScadenza: 0,
  })
  const [certificatiUrgenti, setCertificatiUrgenti] = useState<CertificatoUrgente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)

      // 1. Recupero conteggi totali
      const { count: countAziende } = await supabase.from('aziende').select('*', { count: 'exact', head: true })
      const { count: countPersone } = await supabase.from('persone').select('*', { count: 'exact', head: true })
      const { count: countCertificati } = await supabase.from('certificati').select('*', { count: 'exact', head: true })

      // 2. Recupero i certificati per calcolare le scadenze
      const { data: certData } = await supabase
        .from('certificati')
        .select(`
          id,
          titolo,
          data_scadenza,
          persona:persone (
            id,
            nome,
            cognome,
            azienda_id,
            azienda:aziende (
              id,
              nome
            )
          )
        `)
        .not('data_scadenza', 'is', null)
        .order('data_scadenza', { ascending: true })

      if (certData) {
        const urgentList = certData.filter((c) => isCertificatoInScadenza(c.data_scadenza))
        
        setTotali({
          aziende: countAziende || 0,
          persone: countPersone || 0,
          certificati: countCertificati || 0,
          inScadenza: urgentList.length,
        })

        setCertificatiUrgenti(urgentList.slice(0, 10) as unknown as CertificatoUrgente[])
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <p className="muted" style={{ padding: '2rem', textAlign: 'center' }}>Caricamento dashboard...</p>
  }

  return (
    <section className="stack">
      <header className="section-header">
        <h2>Dashboard</h2>
        <p className="muted">Panoramica generale dello stato della sicurezza aziendale</p>
      </header>

      {/* Griglia delle Metriche (2 sopra e 2 sotto su mobile) */}
      <div className="dashboard-metrics-grid">
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="muted" style={{ fontSize: '0.85rem' }}>Totale Aziende</span>
          <h3 style={{ fontSize: '1.8rem', margin: '0.3rem 0 0 0', color: '#0284c7' }}>{totali.aziende}</h3>
        </div>
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="muted" style={{ fontSize: '0.85rem' }}>Totale Dipendenti</span>
          <h3 style={{ fontSize: '1.8rem', margin: '0.3rem 0 0 0', color: '#10b981' }}>{totali.persone}</h3>
        </div>
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="muted" style={{ fontSize: '0.85rem' }}>Certificati Attivi</span>
          <h3 style={{ fontSize: '1.8rem', margin: '0.3rem 0 0 0', color: '#6366f1' }}>{totali.certificati}</h3>
        </div>
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="muted" style={{ fontSize: '0.85rem' }}>⚠️ In Scadenza / Scaduti</span>
          <h3 style={{ fontSize: '1.8rem', margin: '0.3rem 0 0 0', color: totali.inScadenza > 0 ? '#d97706' : '#111' }}>
            {totali.inScadenza}
          </h3>
        </div>
      </div>

      {/* Sezione Scadenze Imminenti ottimizzata mobile */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>⚠️ Top 10 Scadenze Imminenti o Scadute</h4>
          <span className="muted" style={{ fontSize: '0.8rem' }}>Ordinate per urgenza</span>
        </div>

        {certificatiUrgenti.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>Ottimo lavoro! Nessun certificato in scadenza al momento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {certificatiUrgenti.map((cert) => {
              const persona = cert.persona
              const azienda = persona?.azienda

              return (
                <div 
                  key={cert.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.6rem', 
                    padding: '1rem', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #d97706' 
                  }}
                >
                  {/* Titolo certificato e badge data in alto */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.3' }}>{cert.titolo}</strong>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: '600', 
                      color: '#b45309', 
                      background: '#fef3c7', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      whiteSpace: 'nowrap' 
                    }}>
                      Scad. {formatDataItaliana(cert.data_scadenza)}
                    </span>
                  </div>

                  {/* Dettagli dipendente / azienda e bottone azione in basso */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.2rem', borderTop: '1px solid #e2e8f0' }}>
                    <div className="muted" style={{ fontSize: '0.82rem' }}>
                      Dipendente: <strong style={{ color: '#334155' }}>{persona ? `${persona.cognome} ${persona.nome}` : 'N/D'}</strong> 
                      {azienda && <span style={{ display: 'inline-block', marginLeft: '0.3rem' }}>— {azienda.nome}</span>}
                    </div>

                    {persona && azienda && (
                      <Link 
                        to={paths.aziende.persone.detail(azienda.id, persona.id)} 
                        style={{ 
                          padding: '0.35rem 0.75rem', 
                          fontSize: '0.78rem', 
                          fontWeight: '500',
                          background: '#0284c7', 
                          color: 'white', 
                          borderRadius: '6px', 
                          textDecoration: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Visualizza
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}