import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { SettoriListPage } from '../pages/settori/SettoriListPage' // <-- Importa la nuova pagina dei settori
import { AziendeListPage } from '../pages/aziende/AziendeListPage'
import { AziendaDetailPage } from '../pages/aziende/AziendaDetailPage'
import { CertificatoDetailPage } from '../pages/certificati/CertificatoDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PersonaDetailPage } from '../pages/persone/PersonaDetailPage'
import { paths } from './paths'

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. HOME / DASHBOARD */}
      <Route
        path={paths.home}
        element={<AppLayout title="Dashboard" />}
      >
        <Route index element={<DashboardPage />} />
      </Route>

      {/* 2. ELENCO SETTORI (Nuova Home principale per i settori) */}
      <Route
        path="/settori"
        element={<AppLayout title="Settori" />}
      >
        <Route index element={<SettoriListPage />} />
      </Route>

      {/* 3. ELENCO AZIENDE FILTRATE PER SETTORE */}
      <Route
        path="/settori/:settoreId/aziende"
        element={<AppLayout title="Aziende per Settore" />}
      >
        <Route index element={<AziendeListPage />} />
      </Route>

      {/* 4. ELENCO GENERALE AZIENDE (Tutte le aziende, senza filtro) */}
      <Route
        path="/aziende"
        element={<AppLayout title="Tutte le Aziende" />}
      >
        <Route index element={<AziendeListPage />} />
      </Route>

      {/* 5. DETTAGLIO AZIENDA */}
      <Route
        path="/aziende/:aziendaId"
        element={<AppLayout title="Dettaglio azienda" />}
      >
        <Route index element={<AziendaDetailPage />} />
      </Route>

      {/* 6. DETTAGLIO PERSONA */}
      <Route
        path="/aziende/:aziendaId/persone/:personaId"
        element={<AppLayout title="Dettaglio persona" />}
      >
        <Route index element={<PersonaDetailPage />} />
      </Route>

      {/* 7. DETTAGLIO CERTIFICATO */}
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