import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGlobalKPIsPPF, getDataByCloser, getDataByOrigin } from '@/lib/queriesPPF'
import { type FiltersPPF as FiltersPPFType } from '@/lib/supabase'
import FiltersPPF from '@/components/FiltersPPF'
import FilterModal from '@/components/FilterModal'
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import SimpleBarChart from '@/components/SimpleBarChart'
import { TrendingUp, Phone, Calendar, Filter } from 'lucide-react'
import { COLORS } from '@/lib/constants'

export default function PPF() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<any>(null)
  const [closerData, setCloserData] = useState<any[]>([])
  const [originData, setOriginData] = useState<any[]>([])
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  useEffect(() => {
    const filters: FiltersPPFType = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      closers: searchParams.get('closers')?.split(',').filter(Boolean),
      offers: searchParams.get('offers')?.split(',').filter(Boolean),
      comercialOrigem: searchParams.get('comercialOrigem')?.split(',').filter(Boolean),
      canalOrigem: searchParams.get('canalOrigem')?.split(',').filter(Boolean),
      ano: searchParams.get('ano') ? Number(searchParams.get('ano')) : undefined,
      trimestre: searchParams.get('trimestre') || undefined,
      mes: searchParams.get('mes') || undefined,
    }

    setLoading(true)
    Promise.all([
      getGlobalKPIsPPF(filters),
      getDataByCloser(filters),
      getDataByOrigin(filters),
    ]).then(([kpisData, closers, origins]) => {
      setKpis(kpisData)
      setCloserData(closers)
      setOriginData(origins)
      setLoading(false)
    })
  }, [searchParams])

  if (loading) {
    return <LoadingState message="A carregar dados PPF..." />
  }

  if (!kpis) {
    return <LoadingState message="Sem dados disponíveis" />
  }

  // Safeguard: ensure all values are numbers
  const safeKpis = {
    ...kpis,
    taxaConversaoMQLtoSQL: Number.isFinite(kpis.taxaConversaoMQLtoSQL) ? kpis.taxaConversaoMQLtoSQL : 0,
    taxaConversaoSQLtoVerbal: Number.isFinite(kpis.taxaConversaoSQLtoVerbal) ? kpis.taxaConversaoSQLtoVerbal : 0,
    taxaShowUpDiscovery: Number.isFinite(kpis.taxaShowUpDiscovery) ? kpis.taxaShowUpDiscovery : 0,
    taxaShowUpFollowUp: Number.isFinite(kpis.taxaShowUpFollowUp) ? kpis.taxaShowUpFollowUp : 0,
    taxaShowUpQA: Number.isFinite(kpis.taxaShowUpQA) ? kpis.taxaShowUpQA : 0,
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
        <FiltersPPF />
      </FilterModal>

      {/* 🎯 FUNIL VISUAL - DESTAQUE MÁXIMO */}
      <div className="card border-2 border-success/40 bg-gradient-to-br from-success/10 to-primary/5">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success" />
          Funil de Conversão PPF
        </h3>
        
        <div className="flex items-center justify-center gap-3">
          {/* MQL */}
          <div className="flex-1 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl p-6 text-center">
            <div className="text-xs text-yellow-300 mb-2 uppercase font-semibold">MQLs</div>
            <div className="text-5xl font-bold mb-1">{safeKpis.mqls}</div>
            <div className="text-xs text-gray-400">Marketing Qualified</div>
          </div>

          {/* Arrow + Taxa */}
          <div className="flex flex-col items-center px-2">
            <div className="text-3xl text-primary">→</div>
            <div className="text-sm font-bold text-primary bg-primary/20 px-3 py-1 rounded-full mt-1">
              {safeKpis.taxaConversaoMQLtoSQL.toFixed(0)}%
            </div>
          </div>

          {/* SQL */}
          <div className="flex-1 bg-blue-500/20 border-2 border-blue-500/50 rounded-xl p-6 text-center">
            <div className="text-xs text-blue-300 mb-2 uppercase font-semibold">SQLs</div>
            <div className="text-5xl font-bold mb-1">{safeKpis.sqls}</div>
            <div className="text-xs text-primary">
              ({safeKpis.taxaConversaoMQLtoSQL.toFixed(0)}% de MQLs)
            </div>
          </div>

          {/* Arrow + Taxa */}
          <div className="flex flex-col items-center px-2">
            <div className="text-3xl text-success">→</div>
            <div className="text-sm font-bold text-success bg-success/20 px-3 py-1 rounded-full mt-1">
              {safeKpis.taxaConversaoSQLtoVerbal.toFixed(0)}%
            </div>
          </div>

          {/* Verbal */}
          <div className="flex-1 bg-green-500/20 border-2 border-green-500/50 rounded-xl p-6 text-center">
            <div className="text-xs text-green-300 mb-2 uppercase font-semibold">Verbal Agreements</div>
            <div className="text-5xl font-bold mb-1">{safeKpis.verbal_agreements}</div>
            <div className="text-xs text-success">
              ({safeKpis.taxaConversaoSQLtoVerbal.toFixed(0)}% de SQLs)
            </div>
          </div>
        </div>
      </div>

      {/* 📊 SECÇÃO 2: PIPELINE (REUNIÕES) COM SHOW-UP RATES EM DESTAQUE */}
      <div className="card border-purple-500/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Pipeline de Reuniões
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Discovery */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-400 mb-1">Discovery</div>
              <div className="text-4xl font-bold">{safeKpis.discoverys}</div>
              <div className="text-2xl font-bold text-success mt-2">
                {safeKpis.taxaShowUpDiscovery.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">taxa comparecimento</div>
            </div>
            <div className="space-y-2 text-sm border-t border-gray-700 pt-3 mt-3">
              {safeKpis.discoverys_no_shows > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">No-shows:</span>
                  <span className="font-semibold text-danger">{safeKpis.discoverys_no_shows}</span>
                </div>
              )}
              {safeKpis.discoverys_reagendadas > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Reagendadas:</span>
                  <span className="font-semibold text-warning">{safeKpis.discoverys_reagendadas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-400 mb-1">Follow-up</div>
              <div className="text-4xl font-bold">{safeKpis.follow_ups}</div>
              <div className="text-2xl font-bold text-success mt-2">
                {safeKpis.taxaShowUpFollowUp.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">taxa comparecimento</div>
            </div>
            <div className="space-y-2 text-sm border-t border-gray-700 pt-3 mt-3">
              {safeKpis.follow_ups_no_shows > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">No-shows:</span>
                  <span className="font-semibold text-danger">{safeKpis.follow_ups_no_shows}</span>
                </div>
              )}
              {safeKpis.follow_ups_reagendadas > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Reagendadas:</span>
                  <span className="font-semibold text-warning">{safeKpis.follow_ups_reagendadas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Q&A */}
          <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-400 mb-1">Q&A Sessions</div>
              <div className="text-4xl font-bold">{safeKpis.qas}</div>
              <div className="text-2xl font-bold text-success mt-2">
                {safeKpis.taxaShowUpQA.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">taxa comparecimento</div>
            </div>
            <div className="space-y-2 text-sm border-t border-gray-700 pt-3 mt-3">
              {safeKpis.qas_no_shows > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">No-shows:</span>
                  <span className="font-semibold text-danger">{safeKpis.qas_no_shows}</span>
                </div>
              )}
              {safeKpis.qas_reagendadas > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Reagendadas:</span>
                  <span className="font-semibold text-warning">{safeKpis.qas_reagendadas}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📞 SECÇÃO 3: LEAD NURTURE & TAXA NO-SHOW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Taxa de No-Show Total - CARD ESTRATÉGICO */}
        <div className="card bg-gradient-to-br from-danger/20 to-danger/5 border-2 border-danger/40">
          <div className="flex items-center justify-between mb-3">
            <Phone className="w-6 h-6 text-danger" />
            <div className="text-xs text-danger uppercase font-semibold">KPI Estratégico</div>
          </div>
          <div className="text-sm text-gray-300 mb-2">Taxa de No-Show Total</div>
          <div className="text-5xl font-bold text-danger mb-2">
            {(() => {
              const totalMeetings = safeKpis.discoverys + safeKpis.follow_ups + safeKpis.qas
              const totalNoShows = safeKpis.discoverys_no_shows + safeKpis.follow_ups_no_shows + safeKpis.qas_no_shows
              return totalMeetings > 0 ? ((totalNoShows / totalMeetings) * 100).toFixed(1) : '0'
            })()}%
          </div>
          <div className="text-xs text-gray-400">
            {safeKpis.discoverys_no_shows + safeKpis.follow_ups_no_shows + safeKpis.qas_no_shows} no-shows de {safeKpis.discoverys + safeKpis.follow_ups + safeKpis.qas} reuniões
          </div>
        </div>

        {/* Lead Nurture */}
        <div className="lg:col-span-2 card border-orange-500/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-orange-400" />
            Lead Nurture & Remarketing
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Leads Agendadas Hoje</div>
              <div className="text-3xl font-bold">{safeKpis.leads_agendadas_hoje}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Compareceram</div>
              <div className="text-3xl font-bold text-success">{safeKpis.leads_compareceram}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Taxa Show-Up Hoje</div>
              <div className="text-3xl font-bold text-primary">
                {safeKpis.leads_agendadas_hoje > 0 
                  ? `${((safeKpis.leads_compareceram / safeKpis.leads_agendadas_hoje) * 100).toFixed(0)}%`
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 SECÇÃO 4: PERFORMANCE POR CLOSER COM TAXAS */}
      {closerData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">🏆 SQLs & Verbal Agreements por Closer</h3>
            <div className="space-y-3">
              {closerData.map((c, idx) => {
                const taxa = c.sqls > 0 ? ((c.verbal_agreements / c.sqls) * 100).toFixed(0) : '0'
                return (
                  <div key={idx} className="bg-dark-hover rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{c.closer}</span>
                      <span className="text-2xl font-bold text-success">{taxa}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>SQLs</span>
                          <span className="font-bold text-primary">{c.sqls}</span>
                        </div>
                        <div className="h-2 bg-dark rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min((c.sqls / Math.max(...closerData.map(x => x.sqls))) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Verbals</span>
                          <span className="font-bold text-success">{c.verbal_agreements}</span>
                        </div>
                        <div className="h-2 bg-dark rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success transition-all"
                            style={{ width: `${Math.min((c.verbal_agreements / Math.max(...closerData.map(x => x.verbal_agreements))) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <SimpleBarChart
            data={closerData.map(c => ({
              name: c.closer,
              Discoverys: c.discoverys,
              'Follow-ups': c.follow_ups,
              'Q&As': c.qas,
            }))}
            title="📅 Reuniões por Closer"
            dataKeys={[
              { key: 'Discoverys', label: 'Discoverys', color: COLORS.purple },
              { key: 'Follow-ups', label: 'Follow-ups', color: COLORS.cyan },
              { key: 'Q&As', label: 'Q&As', color: COLORS.pink },
            ]}
          />
        </div>
      )}

      {/* 📍 SECÇÃO 5: RASTREIO DE ORIGEM */}
      {originData.length > 0 && (
        <div className="card border-success/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            De Onde Vieram os Leads que Fecharam?
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Rastreamento: Qual comercial + canal de aquisição gerou os Verbal Agreements
          </p>
          
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Comercial Origem</th>
                  <th>Canal Origem</th>
                  <th className="text-right">MQLs</th>
                  <th className="text-right">SQLs</th>
                  <th className="text-right">🤝 Verbals</th>
                  <th className="text-right">Taxa MQL→Verbal</th>
                  <th className="text-right">Taxa SQL→Verbal</th>
                </tr>
              </thead>
              <tbody>
                {originData.map((origin, idx) => {
                  const taxaMQLtoVerbal = origin.mqls > 0 
                    ? ((origin.verbal_agreements / origin.mqls) * 100).toFixed(0) 
                    : '-'
                  const taxaSQLtoVerbal = origin.sqls > 0 
                    ? ((origin.verbal_agreements / origin.sqls) * 100).toFixed(0) 
                    : '-'
                  
                  return (
                    <tr key={idx}>
                      <td className="font-medium">{origin.comercial}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          origin.canal === 'Cold Calling' ? 'bg-blue-500/20 text-blue-300' :
                          origin.canal === 'Anúncios' ? 'bg-orange-500/20 text-orange-300' :
                          origin.canal === 'Email Marketing' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {origin.canal}
                        </span>
                      </td>
                      <td className="text-right">{origin.mqls}</td>
                      <td className="text-right">{origin.sqls}</td>
                      <td className="text-right">
                        <span className="text-xl font-bold text-success">{origin.verbal_agreements}</span>
                      </td>
                      <td className="text-right text-gray-400">
                        {taxaMQLtoVerbal !== '-' ? `${taxaMQLtoVerbal}%` : '-'}
                      </td>
                      <td className="text-right">
                        <span className={`font-bold text-lg ${
                          taxaSQLtoVerbal !== '-' ? 'text-success' : 'text-gray-500'
                        }`}>
                          {taxaSQLtoVerbal !== '-' ? `${taxaSQLtoVerbal}%` : '-'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
            <div className="text-sm text-gray-300">
              💡 <strong>Insight:</strong> Esta tabela mostra quais comerciais e canais do EOD geraram os leads que depois fecharam no PPF (Verbal Agreements).
            </div>
          </div>
        </div>
      )}

      {/* Resumo Final */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-dark-hover">
          <div className="text-xs text-gray-400 mb-1">Total No-Shows</div>
          <div className="text-2xl font-bold text-danger">
            {safeKpis.discoverys_no_shows + safeKpis.follow_ups_no_shows + safeKpis.qas_no_shows}
          </div>
        </div>
        <div className="card bg-dark-hover">
          <div className="text-xs text-gray-400 mb-1">Total Reagendamentos</div>
          <div className="text-2xl font-bold text-warning">
            {safeKpis.discoverys_reagendadas + safeKpis.follow_ups_reagendadas + safeKpis.qas_reagendadas}
          </div>
        </div>
        <div className="card bg-dark-hover">
          <div className="text-xs text-gray-400 mb-1">MQLs (Comercial)</div>
          <div className="text-2xl font-bold">{safeKpis.mqls_comercial}</div>
          <div className="text-xs text-gray-500 mt-1">Do EOD</div>
        </div>
        <div className="card bg-dark-hover">
          <div className="text-xs text-gray-400 mb-1">Verbals (Comercial)</div>
          <div className="text-2xl font-bold text-success">{safeKpis.verbal_agreements_comercial}</div>
          <div className="text-xs text-gray-500 mt-1">Do EOD</div>
        </div>
      </div>
    </div>
  )
}
