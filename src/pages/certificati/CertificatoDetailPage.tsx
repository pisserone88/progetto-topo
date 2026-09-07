import { useParams } from 'react-router-dom'

export function CertificatoDetailPage() {
  const { certificatoId = '' } = useParams<{ certificatoId: string }>()

  return (
    <section className="stack">
      <header className="section-header">
        <h2>Dettaglio certificato</h2>
        <p className="muted">ID: {certificatoId}</p>
      </header>

      <div className="detail-card">
        <p>Qui verranno mostrati i dettagli del certificato selezionato.</p>
      </div>
    </section>
  )
}
