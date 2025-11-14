import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  getGlobalKPIsMF, 
  getDataByCloserMF, 
  getDataByComercialMF,
  getMonthlyTrendMF,
  getDataByMarketMF,
  getRegistosMF
} from '@/lib/queriesMF'
import { type FiltersMF as FiltersMFType } from '@/lib/supabase'
import FiltersMF from '@/components/FiltersMF'
import FilterModal from '@/components/FilterModal'
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import SimpleBarChart from '@/components/SimpleBarChart'
import LineChart from '@/components/LineChart'
import { TrendingUp, DollarSign, Package, BarChart3, Filter } from 'lucide-react'
import { COLORS } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'

export default function MF() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<any>(null)
  const [closerData, setCloserData] = useState<any[]>([])
  const [comercialData, setComercialData] = useState<any[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([])
  const [marketData, setMarketData] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [closerFilter, setCloserFilter] = useState<string>('')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  useEffect(() => {
    const filters: FiltersMFType = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      executives: searchParams.get('executives')?.split(',').filter(Boolean),
      offers: searchParams.get('offers')?.split(',').filter(Boolean),
      mercados: searchParams.get('mercados')?.split(',').filter(Boolean),
      closers: searchParams.get('closers')?.split(',').filter(Boolean),
      comerciais: searchParams.get('comerciais')?.split(',').filter(Boolean),
      canais: searchParams.get('canais')?.split(',').filter(Boolean),
      ano: searchParams.get('ano') ? Number(searchParams.get('ano')) : undefined,
      trimestre: searchParams.get('trimestre') || undefined,
      mes: searchParams.get('mes') || undefined,
    }

    setLoading(true)
    Promise.all([
      getGlobalKPIsMF(filters),
      getDataByCloserMF(filters),
      getDataByComercialMF(filters),
      getMonthlyTrendMF(filters),
      getDataByMarketMF(filters),
      getRegistosMF({ ...filters, tipoRegisto: 'projeto' }),
    ]).then(([kpisData, closers, comerciais, trend, markets, projs]) => {
      setKpis(kpisData)
      setCloserData(closers)
      setComercialData(comerciais)
      setMonthlyTrend(trend)
      setMarketData(markets)
      setProjetos(projs)
      setLoading(false)
    })
  }, [searchParams])

  if (loading) {
    return <LoadingState message="A carregar dados MF..." />
  }

  if (!kpis) {
    return <LoadingState message="Sem dados disponíveis" />
  }

  return (
    <div className="space-y-6">
      {/* Período Rápido + Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <QuickPeriodSelector />
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="btn bg-dark-card border border-gray-700 hover:border-primary flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
        </button>
      </div>

      {/* Modal de Filtros */}
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <FiltersMF />
      </FilterModal>

      {/* 💰 SECÇÃO 1: KPIS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-success/20 to-success/5 border-2 border-success/40">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Total Receita</div>
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div className="text-4xl font-bold text-success mb-1">
            {formatCurrency(kpis.totalReceita)}
          </div>
          <div className="text-xs text-gray-400">{kpis.totalProjetos} projetos</div>
        </div>

        <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Ticket Médio</div>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div className="text-4xl font-bold text-primary mb-1">
            {formatCurrency(kpis.ticketMedio)}
          </div>
          <div className="text-xs text-gray-400">projetos com receita</div>
        </div>

        {/* ✅ Novo Card: Receita Mensal Recorrente */}
        <div className="card bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border-2 border-cyan-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Receita Mensal (Prestações)</div>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-4xl font-bold text-cyan-400 mb-1">
            {formatCurrency(kpis.receitaMensalRecorrente)}
          </div>
          <div className="text-xs text-gray-400">Total em prestações</div>
        </div>

        <div className="card bg-gradient-to-br from-warning/20 to-warning/5 border-2 border-warning/40">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Total Projetos</div>
            <Package className="w-5 h-5 text-warning" />
          </div>
          <div className="text-4xl font-bold text-warning mb-1">
            {kpis.totalProjetos}
          </div>
          <div className="text-xs text-gray-400">fechados no período</div>
        </div>
      </div>

      {/* 📊 SECÇÃO 2: BREAKDOWN POR OFFER */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Receita por Offer
        </h3>
        
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Offer</th>
                <th className="text-right">Projetos</th>
                <th className="text-right">Receita</th>
                <th className="text-right">Ticket Médio</th>
                <th className="text-right">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(kpis.byOffer).map(([offer, data]: [string, any]) => (
                <tr key={offer}>
                  <td className="font-medium">{offer}</td>
                  <td className="text-right">{data.count}</td>
                  <td className="text-right text-success font-semibold">
                    {formatCurrency(data.receita)}
                  </td>
                  <td className="text-right">
                    {formatCurrency(data.receita / data.count)}
                  </td>
                  <td className="text-right text-primary">
                    {((data.receita / kpis.totalReceita) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💳 SECÇÃO 3: MODO DE PAGAMENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Modo de Pagamento</h3>
          <div className="space-y-3">
            {Object.entries(kpis.byPaymentMode).map(([mode, data]: [string, any]) => (
              <div key={mode} className="p-3 bg-dark-hover rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{mode}</div>
                  <div className="text-xl font-bold text-success">
                    {formatCurrency(data.receita)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{data.count} projetos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{(data.percentReceita || 0).toFixed(0)}% do total</span>
                    <div className="w-16 h-2 bg-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success transition-all"
                        style={{ width: `${Math.min(data.percentReceita || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🎯 CANAL DE AQUISIÇÃO - ✅ com ticket médio */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Canal de Aquisição</h3>
          <div className="space-y-3">
            {Object.entries(kpis.byChannel).map(([channel, data]: [string, any]) => {
              const ticketMedio = data.count > 0 ? data.receita / data.count : 0
              return (
                <div key={channel} className="p-3 bg-dark-hover rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        channel === 'Cold Calling' ? 'bg-blue-500/20 text-blue-300' :
                        channel === 'Anúncios' ? 'bg-orange-500/20 text-orange-300' :
                        channel === 'Email Marketing' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {channel}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-success">
                      {formatCurrency(data.receita)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{data.count} projetos</span>
                    <div className="text-right">
                      <span className="text-primary font-semibold">
                        Ticket médio: {formatCurrency(ticketMedio)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 🏆 SECÇÃO 4: PERFORMANCE POR CLOSER & COMERCIAL */}
      {(closerData.length > 0 || comercialData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {closerData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">🏆 Performance por Closer</h3>
              <div className="space-y-3">
                {closerData.map((c, idx) => {
                  // ✅ Close Rate = projetos / SQLs (se tivermos essa info)
                  // Para já mostramos apenas os dados que temos
                  return (
                    <div key={idx} className="bg-dark-hover rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{c.closer}</span>
                        <div className="text-right">
                          <div className="text-xl font-bold text-success">
                            {formatCurrency(c.receita)}
                          </div>
                          <div className="text-xs text-gray-400">{c.projetos} projetos</div>
                        </div>
                      </div>
                      <div className="h-2 bg-dark rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success transition-all"
                          style={{ width: `${Math.min((c.receita / Math.max(...closerData.map(x => x.receita))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg text-xs text-gray-300">
                💡 <strong>Nota:</strong> Close Rate requer integração com dados de SQLs do PPF
              </div>
            </div>
          )}

          {comercialData.length > 0 && (
            <SimpleBarChart
              data={comercialData.map(c => ({
                name: c.comercial,
                Receita: c.receita,
                Projetos: c.projetos,
              }))}
              title="📞 Performance por Comercial"
              dataKeys={[
                { key: 'Receita', label: 'Receita (€)', color: COLORS.primary },
              ]}
            />
          )}
        </div>
      )}

      {/* 📈 SECÇÃO 5: EVOLUÇÃO MENSAL - ✅ Gráfico de Linha com Duplo Eixo */}
      {monthlyTrend.length > 0 && (
        <LineChart
          data={monthlyTrend.map(m => ({
            name: m.mes,
            Receita: m.receita,
            Projetos: m.projetos,
          }))}
          title="📈 Evolução Mensal"
          dataKeys={[
            { key: 'Receita', label: 'Receita (€)', color: COLORS.success, yAxisId: 'left' },
            { key: 'Projetos', label: 'Projetos', color: COLORS.warning, yAxisId: 'right' },
          ]}
          dualAxis={true}
        />
      )}

      {/* 🏢 SECÇÃO 6: MERCADOS - ✅ Ocultando mercados sem receita */}
      {marketData.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Performance por Mercado
            </h3>
            <div className="text-xs text-gray-400">
              Apenas mercados com receita
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Mercado</th>
                  <th className="text-right">Projetos</th>
                  <th className="text-right">Receita</th>
                  <th className="text-right">Ticket Médio</th>
                  <th className="text-right">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((market) => (
                  <tr key={market.mercado}>
                    <td className="font-medium">{market.mercado}</td>
                    <td className="text-right">{market.projetos}</td>
                    <td className="text-right text-success font-semibold">
                      {formatCurrency(market.receita)}
                    </td>
                    <td className="text-right">
                      {formatCurrency(market.receita / market.projetos)}
                    </td>
                    <td className="text-right text-primary">
                      {((market.receita / kpis.totalReceita) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📋 SECÇÃO 7: LISTA DE PROJETOS - ✅ com filtro por closer */}
      {projetos.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-warning" />
              Últimos Projetos Fechados
            </h3>
            {/* ✅ Filtro por Closer */}
            <select
              value={closerFilter}
              onChange={(e) => setCloserFilter(e.target.value)}
              className="px-3 py-2 bg-dark-card border border-gray-700 rounded-lg text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Todos os Closers</option>
              {Array.from(new Set(projetos.map(p => p.closer).filter(Boolean))).sort().map(closer => (
                <option key={closer} value={closer}>{closer}</option>
              ))}
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Offer</th>
                  <th>Mercado</th>
                  <th className="text-right">Ticket</th>
                  <th>Modo Pgto</th>
                  <th>Canal</th>
                  <th>Comercial</th>
                  <th>Closer</th>
                </tr>
              </thead>
              <tbody>
                {projetos
                  .filter(p => !closerFilter || p.closer === closerFilter)
                  .slice(0, 20)
                  .map((proj) => (
                  <tr key={proj.id}>
                    <td className="text-sm">{new Date(proj.dia).toLocaleDateString('pt-PT')}</td>
                    <td className="font-medium">{proj.cliente}</td>
                    <td>
                      <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                        {proj.offer || '-'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-400">{proj.mercado || '-'}</td>
                    <td className="text-right text-success font-semibold">
                      {proj.ticket ? formatCurrency(proj.ticket) : '-'}
                    </td>
                    <td className="text-sm">{proj.modo_pagamento || '-'}</td>
                    <td>
                      {proj.canal_aquisicao && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          proj.canal_aquisicao === 'Cold Calling' ? 'bg-blue-500/20 text-blue-300' :
                          proj.canal_aquisicao === 'Anúncios' ? 'bg-orange-500/20 text-orange-300' :
                          proj.canal_aquisicao === 'Email Marketing' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {proj.canal_aquisicao}
                        </span>
                      )}
                    </td>
                    <td className="text-sm">{proj.comercial_consultor || '-'}</td>
                    <td className="text-sm font-medium">{proj.closer || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projetos.filter(p => !closerFilter || p.closer === closerFilter).length > 20 && (
            <div className="mt-4 text-center text-sm text-gray-400">
              A mostrar 20 de {projetos.filter(p => !closerFilter || p.closer === closerFilter).length} projetos{closerFilter && ` de ${closerFilter}`}. Use os filtros para refinar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}


