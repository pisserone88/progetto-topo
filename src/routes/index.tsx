import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { SettoriListPage } from '../pages/settori/SettoriListPage'
import { AziendeListPage } from '../pages/aziende/AziendeListPage'
import { AziendaDetailPage } from '../pages/aziende/AziendaDetailPage'
import { CertificatoDetailPage } from '../pages/certificati/CertificatoDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PersonaDetailPage } from '../pages/persone/PersonaDetailPage'
import { ChecklistPage } from '../pages/checklist/ChecklistPage'
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

      {/* 2. ELENCO SETTORI */}
      <Route
        path={paths.settori.list}
        element={<AppLayout title="Settori" />}
      >
        <Route index element={<SettoriListPage />} />
      </Route>

      {/* 3. ELENCO AZIENDE FILTRATE PER SETTORE */}
      <Route
        path={paths.settori.detail(':settoreId')}
        element={<AppLayout title="Aziende per Settore" />}
      >
        <Route index element={<AziendeListPage />} />
      </Route>

      {/* 4. ELENCO GENERALE AZIENDE */}
      <Route
        path={paths.aziende.list}
        element={<AppLayout title="Tutte le Aziende" />}
      >
        <Route index element={<AziendeListPage />} />
      </Route>

      {/* 5. DETTAGLIO AZIENDA */}
      <Route
        path={paths.aziende.detail(':aziendaId')}
        element={<AppLayout title="Dettaglio azienda" />}
      >
        <Route index element={<AziendaDetailPage />} />
      </Route>

      {/* 6. DETTAGLIO PERSONA */}
      <Route
        path={paths.aziende.persone.detail(':aziendaId', ':personaId')}
        element={<AppLayout title="Dettaglio persona" />}
      >
        <Route index element={<PersonaDetailPage />} />
      </Route>

      {/* 7. DETTAGLIO CERTIFICATO */}
      <Route
        path={paths.aziende.persone.certificati.detail(':aziendaId', ':personaId', ':certificatoId')}
        element={<AppLayout title="Dettaglio certificato" />}
      >
        <Route index element={<CertificatoDetailPage />} />
      </Route>

      {/* 8. CHECKLIST GENERALE */}
      <Route
        path={paths.checklist.list}
        element={<AppLayout title="Checklist" />}
      >
        <Route index element={<ChecklistPage />} />
      </Route>

      {/* 9. CHECKLIST SPECIFICA AZIENDA */}
      <Route
        path={paths.checklist.detail(':aziendaId')}
        element={<AppLayout title="Checklist Azienda" />}
      >
        <Route index element={<ChecklistPage />} />
      </Route>

      {/* Fallback per pagine non trovate */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}