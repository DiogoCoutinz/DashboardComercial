import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X, ChevronDown } from 'lucide-react'
import { getFilterOptionsMF } from '@/lib/queriesMF'

export default function FiltersMF() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [options, setOptions] = useState({
    executives: [] as string[],
    offers: [] as string[],
    mercados: [] as string[],
    closers: [] as string[],
    comerciais: [] as string[],
    canais: [] as string[],
    anos: [] as number[],
    trimestres: [] as string[],
    meses: [] as string[],
  })

  useEffect(() => {
    getFilterOptionsMF().then(setOptions)
  }, [])

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  const handleMultiSelectChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    const current = params.get(key)?.split(',').filter(Boolean) || []
    
    if (current.includes(value)) {
      const updated = current.filter(v => v !== value)
      if (updated.length > 0) {
        params.set(key, updated.join(','))
      } else {
        params.delete(key)
      }
    } else {
      params.set(key, [...current, value].join(','))
    }
    
    setSearchParams(params)
  }

  const clearFilters = () => {
    // Keep only date filters
    const params = new URLSearchParams()
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    setSearchParams(params)
  }

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    k => !['startDate', 'endDate'].includes(k)
  )

  const selectedExecutives = searchParams.get('executives')?.split(',').filter(Boolean) || []
  const selectedOffers = searchParams.get('offers')?.split(',').filter(Boolean) || []
  const selectedMercados = searchParams.get('mercados')?.split(',').filter(Boolean) || []
  const selectedClosers = searchParams.get('closers')?.split(',').filter(Boolean) || []
  const selectedComerciais = searchParams.get('comerciais')?.split(',').filter(Boolean) || []
  const selectedCanais = searchParams.get('canais')?.split(',').filter(Boolean) || []

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">
            Filtros {hasActiveFilters && `(${Array.from(searchParams.keys()).filter(k => !['startDate', 'endDate'].includes(k)).length})`}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-danger hover:text-danger/80 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar filtros
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-dark-hover">
          {/* Executives */}
          {options.executives.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Executive</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {options.executives.map(exec => (
                  <label key={exec} className="flex items-center gap-2 text-sm hover:bg-dark-hover p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExecutives.includes(exec)}
                      onChange={() => handleMultiSelectChange('executives', exec)}
                      className="rounded border-gray-600"
                    />
                    <span>{exec}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Offers */}
          {options.offers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Offer</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {options.offers.map(offer => (
                  <label key={offer} className="flex items-center gap-2 text-sm hover:bg-dark-hover p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOffers.includes(offer)}
                      onChange={() => handleMultiSelectChange('offers', offer)}
                      className="rounded border-gray-600"
                    />
                    <span>{offer}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Mercados */}
          {options.mercados.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Mercado</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {options.mercados.map(mercado => (
                  <label key={mercado} className="flex items-center gap-2 text-sm hover:bg-dark-hover p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMercados.includes(mercado)}
                      onChange={() => handleMultiSelectChange('mercados', mercado)}
                      className="rounded border-gray-600"
                    />
                    <span>{mercado}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Closers */}
          {options.closers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Closer</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {options.closers.map(closer => (
                  <label key={closer} className="flex items-center gap-2 text-sm hover:bg-dark-hover p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClosers.includes(closer)}
                      onChange={() => handleMultiSelectChange('closers', closer)}
                      className="rounded border-gray-600"
                    />
                    <span>{closer}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Comerciais */}
          {options.comerciais.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Comercial</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {options.comerciais.map(comercial => (
                  <label key={comercial} className="flex items-center gap-2 text-sm hover:bg-dark-hover p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedComerciais.includes(comercial)}
                      onChange={() => handleMultiSelectChange('comerciais', comercial)}
                      className="rounded border-gray-600"
                    />
                    <span>{comercial}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Canais */}
          {options.canais.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Canal</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {options.canais.map(canal => (
                  <label key={canal} className="flex items-center gap-2 text-sm hover:bg-dark-hover p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCanais.includes(canal)}
                      onChange={() => handleMultiSelectChange('canais', canal)}
                      className="rounded border-gray-600"
                    />
                    <span>{canal}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Ano */}
          {options.anos.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Ano</label>
              <select
                value={searchParams.get('ano') || ''}
                onChange={(e) => handleFilterChange('ano', e.target.value || null)}
                className="w-full bg-dark-hover border border-dark-hover rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                {options.anos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
          )}

          {/* Trimestre */}
          {options.trimestres.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Trimestre</label>
              <select
                value={searchParams.get('trimestre') || ''}
                onChange={(e) => handleFilterChange('trimestre', e.target.value || null)}
                className="w-full bg-dark-hover border border-dark-hover rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                {options.trimestres.map(trimestre => (
                  <option key={trimestre} value={trimestre}>{trimestre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Mês */}
          {options.meses.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Mês</label>
              <select
                value={searchParams.get('mes') || ''}
                onChange={(e) => handleFilterChange('mes', e.target.value || null)}
                className="w-full bg-dark-hover border border-dark-hover rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                {options.meses.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

