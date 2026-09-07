import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage' // <-- Importa la Dashboard
import { AziendaDetailPage } from '../pages/aziende/AziendaDetailPage'
import { AziendeListPage } from '../pages/aziende/AziendeListPage'
import { CertificatoDetailPage } from '../pages/certificati/CertificatoDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PersonaDetailPage } from '../pages/persone/PersonaDetailPage'
import { paths } from './paths'

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. HOME / DASHBOARD (http://localhost:3001/) */}
      <Route
        path={paths.home}
        element={<AppLayout title="Dashboard" />}
      >
        <Route index element={<DashboardPage />} />
      </Route>

      {/* 2. ELENCO AZIENDE (http://localhost:3001/aziende) */}
      <Route
        path="/aziende"
        element={<AppLayout title="Aziende" />}
      >
        <Route index element={<AziendeListPage />} />
      </Route>

      {/* 3. DETTAGLIO AZIENDA */}
      <Route
        path="/aziende/:aziendaId"
        element={<AppLayout title="Dettaglio azienda" />}
      >
        <Route index element={<AziendaDetailPage />} />
      </Route>

      {/* 4. DETTAGLIO PERSONA */}
      <Route
        path="/aziende/:aziendaId/persone/:personaId"
        element={<AppLayout title="Dettaglio persona" />}
      >
        <Route index element={<PersonaDetailPage />} />
      </Route>

      {/* 5. DETTAGLIO CERTIFICATO */}
      <Route
        path="/aziende/:aziendaId/persone/:personaId/certificati/:certificatoId"
        element={<AppLayout title="Dettaglio certificato" />}
      >
        <Route index element={<CertificatoDetailPage />} />
      </Route>

      {/* Fallback per pagine non trovate */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}