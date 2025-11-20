import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFilterOptions } from '@/lib/queries'
import { Filter, X, Calendar } from 'lucide-react'

export default function Filters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [options, setOptions] = useState<{
    comerciais: string[]
    canais: string[]
    offers: string[]
    anos: number[]
    trimestres: string[]
    meses: string[]
  }>({
    comerciais: [],
    canais: [],
    offers: [],
    anos: [],
    trimestres: [],
    meses: [],
  })

  useEffect(() => {
    getFilterOptions().then(setOptions)
  }, [])

  const selectedComerciais = searchParams.get('comerciais')?.split(',').filter(Boolean) || []
  const selectedCanais = searchParams.get('canais')?.split(',').filter(Boolean) || []
  const selectedOffers = searchParams.get('offers')?.split(',').filter(Boolean) || []
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
    selectedComerciais.length > 0 || 
    selectedCanais.length > 0 || 
    selectedOffers.length > 0 ||
    selectedAno || 
    selectedTrimestre || 
    selectedMes ||
    startDate ||
    endDate

  const filterCount = 
    selectedComerciais.length + 
    selectedCanais.length + 
    selectedOffers.length +
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
          <span>Filtros</span>
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
                placeholder="Selecione a data"
                className="w-full cursor-pointer"
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
                placeholder="Selecione a data"
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Comerciais */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Comercial ({selectedComerciais.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-dark-bg p-2 rounded">
                {options.comerciais.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-dark-hover p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedComerciais.includes(c)}
                      onChange={() => toggleItem('comerciais', c, selectedComerciais)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">{c}</span>
                  </label>
                ))}
                {options.comerciais.length === 0 && (
                  <div className="text-xs text-gray-500 p-2">Sem dados</div>
                )}
              </div>
            </div>

            {/* Canais */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Canal ({selectedCanais.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-dark-bg p-2 rounded">
                {options.canais.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-dark-hover p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCanais.includes(c)}
                      onChange={() => toggleItem('canais', c, selectedCanais)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">{c}</span>
                  </label>
                ))}
                {options.canais.length === 0 && (
                  <div className="text-xs text-gray-500 p-2">Sem dados</div>
                )}
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
                {options.offers.length === 0 && (
                  <div className="text-xs text-gray-500 p-2">Sem dados</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Ano */}
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

            {/* Trimestre */}
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

            {/* Mês */}
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
