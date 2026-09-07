import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { DynamicBreadcrumb } from "../ui/DynamicBreadcrumb"
import { paths } from "../../routes/paths"

type AppLayoutProps = {
  title: string
}

export function AppLayout({ title }: AppLayoutProps) {
  const location = useLocation()
  // Sidebar impostata di default a chiusa (false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path
  const linkClassName = (path: string) => isActive(path) ? 'active' : ''

  // Funzione per chiudere la sidebar automaticamente su mobile al click di un link
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar a comparsa */}
      <aside className={`app-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="app-sidebar__top">
          <div className="app-sidebar__brand" style={{ margin: 0, padding: 0 }}>
            <h3>Gestione Aziende</h3>
            <p className="muted" style={{ margin: 0 }}>Controllo Scadenze</p>
          </div>
          {/* Pulsante "X" per chiudere la sidebar dall'interno */}
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="close-sidebar-btn"
            title="Chiudi Menu"
          >
            ✕
          </button>
        </div>

        <nav>
          <Link to="/" className={linkClassName('/')} onClick={handleLinkClick}>
            📊 Dashboard
          </Link>
          <Link to={paths.aziende.list} className={linkClassName(paths.aziende.list)} onClick={handleLinkClick}>
            🏢 Aziende
          </Link>
        </nav>

        <div className="app-sidebar__footer">
          Versione 2.0
        </div>
      </aside>

      {/* Area Principale */}
      <div className="app-content-area">
        <header className="app-header">
          <div className="app-header__left">
            {/* Pulsante Hamburger visibile solo quando la sidebar è chiusa */}
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="hamburger-btn"
                title="Apri Menu"
              >
                ☰
              </button>
            )}
            <div>
              <p className="app-header__eyebrow">Gestione Aziende</p>
              <h1>{title}</h1>
            </div>
          </div>
          <DynamicBreadcrumb />
        </header>
        
        <div className="app-layout">
          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}