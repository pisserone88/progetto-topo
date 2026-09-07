import { Link } from 'react-router-dom'
import { paths } from '../routes/paths'

export function NotFoundPage() {
  return (
    <section className="empty-state">
      <h2>Pagina non trovata</h2>
      <p>La risorsa richiesta non esiste o è stata spostata.</p>
      <Link to={paths.home}>Torna alle aziende</Link>
    </section>
  )
}
