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
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import SimpleBarChart from '@/components/SimpleBarChart'
import { TrendingUp, DollarSign, Package, BarChart3 } from 'lucide-react'
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold"> MF — Projetos Fechados</h2>
          <p className="text-sm text-gray-400 mt-1">Receita gerada e projetos concretizados</p>
        </div>
      </div>

      <QuickPeriodSelector />
      <FiltersMF />

      {/* 💰 SECÇÃO 1: KPIS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="text-xs text-gray-400">por projeto</div>
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
              <div key={mode} className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
                <div>
                  <div className="font-medium">{mode}</div>
                  <div className="text-xs text-gray-400">{data.count} projetos</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">
                    {formatCurrency(data.receita)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {((data.receita / kpis.totalReceita) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🎯 CANAL DE AQUISIÇÃO */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Canal de Aquisição</h3>
          <div className="space-y-3">
            {Object.entries(kpis.byChannel).map(([channel, data]: [string, any]) => (
              <div key={channel} className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
                <div>
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
                  <div className="text-xs text-gray-400 mt-1">{data.count} projetos</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">
                    {formatCurrency(data.receita)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {((data.receita / kpis.totalReceita) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🏆 SECÇÃO 4: PERFORMANCE POR CLOSER & COMERCIAL */}
      {(closerData.length > 0 || comercialData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {closerData.length > 0 && (
            <SimpleBarChart
              data={closerData.map(c => ({
                name: c.closer,
                Receita: c.receita,
                Projetos: c.projetos,
              }))}
              title="🏆 Performance por Closer"
              dataKeys={[
                { key: 'Receita', label: 'Receita (€)', color: COLORS.success },
              ]}
            />
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

      {/* 📈 SECÇÃO 5: EVOLUÇÃO MENSAL */}
      {monthlyTrend.length > 0 && (
        <SimpleBarChart
          data={monthlyTrend.map(m => ({
            name: m.mes,
            Receita: m.receita,
            Projetos: m.projetos,
          }))}
          title="📈 Evolução Mensal"
          dataKeys={[
            { key: 'Receita', label: 'Receita (€)', color: COLORS.success },
            { key: 'Projetos', label: 'Projetos', color: COLORS.primary },
          ]}
        />
      )}

      {/* 🏢 SECÇÃO 6: MERCADOS */}
      {marketData.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Performance por Mercado
          </h3>
          
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

      {/* 📋 SECÇÃO 7: LISTA DE PROJETOS */}
      {projetos.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-warning" />
            Últimos Projetos Fechados
          </h3>
          
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
                {projetos.slice(0, 20).map((proj) => (
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

          {projetos.length > 20 && (
            <div className="mt-4 text-center text-sm text-gray-400">
              A mostrar 20 de {projetos.length} projetos. Use os filtros para refinar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

