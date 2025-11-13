import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Users, UserCircle, Package, RefreshCw, DollarSign } from 'lucide-react'
import ShareButton from './ShareButton'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'EOD', icon: BarChart3 },
    { path: '/ppf', label: 'PPF', icon: Users },
    { path: '/mf', label: 'MF', icon: DollarSign },
    { path: '/comerciais', label: 'Comerciais', icon: UserCircle },
    { path: '/canais', label: 'Canais', icon: Package },
    { path: '/funil', label: 'Funil EOD', icon: BarChart3 },
  ]

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

      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-b-2 transition-all text-sm whitespace-nowrap
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

