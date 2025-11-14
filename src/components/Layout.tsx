import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Users, UserCircle, Package, RefreshCw, DollarSign } from 'lucide-react'
import ShareButton from './ShareButton'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const location = useLocation()

  // Main tabs - 3 core reporting logics
  const mainTabs = [
    { path: '/', label: 'EOD', icon: BarChart3, description: 'Prospecting' },
    { path: '/ppf', label: 'PPF', icon: Users, description: 'Performance Pós-First' },
    { path: '/mf', label: 'MF', icon: DollarSign, description: 'Projetos Fechados' },
  ]

  // Secondary navigation (only for EOD)
  const secondaryNav = [
    { path: '/comerciais', label: 'Comerciais', icon: UserCircle },
    { path: '/canais', label: 'Canais', icon: Package },
    { path: '/funil', label: 'Funil', icon: BarChart3 },
  ]

  const isEODSection = location.pathname === '/' || 
                       location.pathname === '/comerciais' || 
                       location.pathname === '/canais' || 
                       location.pathname === '/funil'

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            📊 BoomLab — Dashboard Comercial
          </h1>
          <div className="flex items-center gap-2">
            <ShareButton />
            <button
              onClick={handleRefresh}
              className="btn flex items-center gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation - 3 Core Tabs */}
      <nav className="border-b border-gray-800 bg-black/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-2 py-2">
            {mainTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.path === '/ppf' ? location.pathname === '/ppf' :
                              tab.path === '/mf' ? location.pathname === '/mf' :
                              isEODSection
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`
                    flex-1 flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-primary/20 text-primary border-2 border-primary/40'
                      : 'bg-dark-card text-gray-400 border-2 border-transparent hover:text-gray-200 hover:border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-lg font-bold">{tab.label}</span>
                  </div>
                  <span className="text-xs opacity-75">{tab.description}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Secondary Navigation - EOD Sub-sections */}
      {isEODSection && (
        <nav className="border-b border-gray-800 bg-black/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto">
              {secondaryNav.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 border-b-2 transition-all text-sm whitespace-nowrap
                      ${isActive
                        ? 'text-primary border-primary'
                        : 'text-gray-400 border-transparent hover:text-gray-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/30 mt-8">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <div>
            Última atualização: <span className="font-mono">{new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="text-gray-500">
            BoomLab Analytics • Powered by Supabase + React
          </div>
        </div>
      </footer>
    </div>
  )
}

