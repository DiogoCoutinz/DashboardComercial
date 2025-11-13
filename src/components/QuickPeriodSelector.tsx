import { useSearchParams } from 'react-router-dom'
import { Calendar } from 'lucide-react'

export default function QuickPeriodSelector() {
  const [searchParams, setSearchParams] = useSearchParams()

  const setQuickPeriod = (period: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const params = new URLSearchParams(searchParams)
    const today = new Date()
    
    // Remove existing date filters
    params.delete('startDate')
    params.delete('endDate')
    params.delete('ano')
    params.delete('trimestre')
    params.delete('mes')

    switch (period) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0]
        params.set('startDate', todayStr)
        params.set('endDate', todayStr)
        break
      
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        params.set('startDate', weekAgo.toISOString().split('T')[0])
        params.set('endDate', today.toISOString().split('T')[0])
        break
      
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        params.set('startDate', monthAgo.toISOString().split('T')[0])
        params.set('endDate', today.toISOString().split('T')[0])
        break
      
      case 'year':
        params.set('ano', today.getFullYear().toString())
        break
      
      case 'all':
        // No filters = all data
        break
    }

    setSearchParams(params)
  }

  const getCurrentPeriod = () => {
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const ano = searchParams.get('ano')
    
    if (startDate && endDate) {
      if (startDate === endDate) return 'today'
      
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 7) return 'week'
      if (diffDays <= 31) return 'month'
    }
    
    if (ano) return 'year'
    
    return 'all'
  }

  const currentPeriod = getCurrentPeriod()

  const buttons = [
    { id: 'today', label: 'Hoje', icon: '📅' },
    { id: 'week', label: 'Última Semana', icon: '📆' },
    { id: 'month', label: 'Último Mês', icon: '🗓️' },
    { id: 'year', label: '2025', icon: '📊' },
    { id: 'all', label: 'Tudo', icon: '🌐' },
  ] as const

  return (
    <div className="card mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-gray-300">Período Rápido</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setQuickPeriod(btn.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${currentPeriod === btn.id
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-dark-hover text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <span className="mr-2">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

