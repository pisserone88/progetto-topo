import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { DynamicBreadcrumb } from "../ui/DynamicBreadcrumb"
import { paths } from "../../routes/paths"

type AppLayoutProps = {
  title: string
}

export function AppLayout({ title }: AppLayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Funzione di controllo attivo corretta e isolata per ogni voce
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    if (path === paths.settori.list) {
      // Diventa attivo solo se siamo dentro /settori (ma NON nella root /)
      return location.pathname.startsWith('/settori')
    }
    // Per tutte le altre rotte (es. /aziende)
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }
  
  const linkClassName = (path: string) => isActive(path) ? 'active' : ''

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
          <Link to={paths.settori.list} className={linkClassName(paths.settori.list)} onClick={handleLinkClick}>
            📁 Settori
          </Link>
          <Link to={paths.aziende.list} className={linkClassName(paths.aziende.list)} onClick={handleLinkClick}>
            🏢 Tutte le Aziende
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