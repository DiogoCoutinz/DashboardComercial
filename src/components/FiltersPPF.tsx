import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFilterOptionsPPF } from '@/lib/queriesPPF'
import { Filter, X, Calendar } from 'lucide-react'

export default function FiltersPPF() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [options, setOptions] = useState<{
    closers: string[]
    offers: string[]
    comerciaisOrigem: string[]
    canaisOrigem: string[]
    anos: number[]
    trimestres: string[]
    meses: string[]
  }>({
    closers: [],
    offers: [],
    comerciaisOrigem: [],
    canaisOrigem: [],
    anos: [],
    trimestres: [],
    meses: [],
  })

  useEffect(() => {
    getFilterOptionsPPF().then(setOptions)
  }, [])

  const selectedClosers = searchParams.get('closers')?.split(',').filter(Boolean) || []
  const selectedOffers = searchParams.get('offers')?.split(',').filter(Boolean) || []
  const selectedComerciais = searchParams.get('comercialOrigem')?.split(',').filter(Boolean) || []
  const selectedCanais = searchParams.get('canalOrigem')?.split(',').filter(Boolean) || []
  const selectedAno = searchParams.get('ano') || ''
  const selectedTrimestre = searchParams.get('trimestre') || ''
  const selectedMes = searchParams.get('mes') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  const updateFilter = (key: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams)
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','))
      } else {
        params.delete(key)
      }
    } else {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    setSearchParams(params)
  }

  const toggleItem = (key: string, item: string, currentSelected: string[]) => {
    const updated = currentSelected.includes(item)
      ? currentSelected.filter(i => i !== item)
      : [...currentSelected, item]
    updateFilter(key, updated)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = 
    selectedClosers.length > 0 || 
    selectedOffers.length > 0 || 
    selectedComerciais.length > 0 ||
    selectedCanais.length > 0 ||
    selectedAno || 
    selectedTrimestre || 
    selectedMes ||
    startDate ||
    endDate

  const filterCount = 
    selectedClosers.length + 
    selectedOffers.length + 
    selectedComerciais.length +
    selectedCanais.length +
    (selectedAno ? 1 : 0) +
    (selectedTrimestre ? 1 : 0) +
    (selectedMes ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0)

  return (
    <div className="card mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros Avançados</span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {filterCount}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-4 pt-3 border-t border-gray-800">
          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Closers */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Closer ({selectedClosers.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-dark-bg p-2 rounded">
                {options.closers.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-dark-hover p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedClosers.includes(c)}
                      onChange={() => toggleItem('closers', c, selectedClosers)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Offers */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Offer ({selectedOffers.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-dark-bg p-2 rounded">
                {options.offers.map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-dark-hover p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedOffers.includes(o)}
                      onChange={() => toggleItem('offers', o, selectedOffers)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">{o}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comercial Origem */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Comercial Origem ({selectedComerciais.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-dark-bg p-2 rounded">
                {options.comerciaisOrigem.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-dark-hover p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedComerciais.includes(c)}
                      onChange={() => toggleItem('comercialOrigem', c, selectedComerciais)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Canal Origem */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Canal Origem ({selectedCanais.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-dark-bg p-2 rounded">
                {options.canaisOrigem.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-dark-hover p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCanais.includes(c)}
                      onChange={() => toggleItem('canalOrigem', c, selectedCanais)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Ano</label>
              <select
                value={selectedAno}
                onChange={(e) => updateFilter('ano', e.target.value)}
                className="w-full"
              >
                <option value="">Todos</option>
                {options.anos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Trimestre</label>
              <select
                value={selectedTrimestre}
                onChange={(e) => updateFilter('trimestre', e.target.value)}
                className="w-full"
              >
                <option value="">Todos</option>
                {options.trimestres.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Mês</label>
              <select
                value={selectedMes}
                onChange={(e) => updateFilter('mes', e.target.value)}
                className="w-full"
              >
                <option value="">Todos</option>
                {options.meses.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

