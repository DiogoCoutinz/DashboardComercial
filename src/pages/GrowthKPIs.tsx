import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import LoadingState from '@/components/LoadingState'
import CircularProgress from '@/components/CircularProgress'
import { TrendingUp, Target, Calendar, Award, CheckCircle } from 'lucide-react'
import { COLORS } from '@/lib/constants'

export default function GrowthKPIs() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [objetivosData, setObjetivosData] = useState<any>(null)
  const [comercialObjetivos, setComercialObjetivos] = useState<any[]>([])

  useEffect(() => {
    loadGrowthData()
  }, [searchParams])

  const loadGrowthData = async () => {
    setLoading(true)
    
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      // 1. Buscar dados EOD para total de agendamentos por semana
      const { data: eodWeekData } = await supabase
        .from('comercial_registos_eod')
        .select('*')
        .gte('dia', '2025-10-01') // Q4 2025
        .order('semana', { ascending: true })

      // 2. Buscar dados PPF agregados por semana (SEM duplicados)
      const { data: ppfData } = await supabase
        .from('comercial_registos_ppf')
        .select('*')
        .gte('dia', '2025-10-01') // Q4 2025
        .order('created_at', { ascending: false }) // Mais recente primeiro

      if (ppfData && eodWeekData) {
        // 🔥 DEDUPLICAR: Pegar apenas o registo mais recente por dia+closer+offer
        const deduplicated = ppfData.reduce((acc: any, r: any) => {
          const key = `${r.dia}_${r.closer}_${r.offer || 'null'}`
          // Só adiciona se ainda não existe (já está ordenado por created_at DESC)
          if (!acc[key]) {
            acc[key] = r
          }
          return acc
        }, {})

        // ✅ AGRUPAR POR DIA depois da deduplicação
        const ppfByDay: any = Object.values(deduplicated).reduce((acc: any, r: any) => {
          const key = `${r.dia}_${r.semana}`
          if (!acc[key]) {
            acc[key] = {
              dia: r.dia,
              semana: r.semana,
              discoverys: 0,
              comparecimentos_discovery: 0,
              discoverys_no_shows: 0,
              discoverys_reagendadas: 0,
              follow_ups: 0,
              follow_ups_no_shows: 0,
              follow_ups_reagendadas: 0,
              qas: 0,
              qas_no_shows: 0,
              qas_reagendadas: 0,
              mqls: 0,
              sqls: 0,
              verbal_agreements: 0,
            }
          }
          // Somar valores por dia
          acc[key].discoverys += r.discoverys || 0
          acc[key].comparecimentos_discovery += r.comparecimentos_discovery || 0
          acc[key].discoverys_no_shows += r.discoverys_no_shows || 0
          acc[key].discoverys_reagendadas += r.discoverys_reagendadas || 0
          acc[key].follow_ups += r.follow_ups || 0
          acc[key].follow_ups_no_shows += r.follow_ups_no_shows || 0
          acc[key].follow_ups_reagendadas += r.follow_ups_reagendadas || 0
          acc[key].qas += r.qas || 0
          acc[key].qas_no_shows += r.qas_no_shows || 0
          acc[key].qas_reagendadas += r.qas_reagendadas || 0
          acc[key].mqls += r.mqls || 0
          acc[key].sqls += r.sqls || 0
          acc[key].verbal_agreements += r.verbal_agreements || 0
          return acc
        }, {})

        // Agora agrupar por SEMANA
        const byWeek: any = (Object.values(ppfByDay) as any[]).reduce((acc: any, r: any) => {
          const week = r.semana || 'S/N'
          if (!acc[week]) {
            acc[week] = {
              semana: week,
              agendamentos: 0,
              discoverys: 0,
              comparecimentos_discovery: 0,
              no_shows: 0,
              reagendadas: 0,
              follow_ups: 0,
              qas: 0,
              mqls: 0,
              sqls: 0,
              verbal_agreements: 0,
            }
          }
          acc[week].discoverys += r.discoverys
          acc[week].comparecimentos_discovery += r.comparecimentos_discovery
          acc[week].no_shows += r.discoverys_no_shows + r.follow_ups_no_shows + r.qas_no_shows
          acc[week].reagendadas += r.discoverys_reagendadas + r.follow_ups_reagendadas + r.qas_reagendadas
          acc[week].follow_ups += r.follow_ups
          acc[week].qas += r.qas
          acc[week].mqls += r.mqls
          acc[week].sqls += r.sqls
          acc[week].verbal_agreements += r.verbal_agreements
          return acc
        }, {})

        // ✅ Adicionar agendamentos do EOD por semana
        // 🔥 DEDUPLICAR EOD também (dia + comercial + canal + offer)
        const eodDeduplicated = eodWeekData.reduce((acc: any, r: any) => {
          const key = `${r.dia}_${r.comercial}_${r.canal_aquisicao}_${r.offer || 'null'}`
          if (!acc[key]) {
            acc[key] = r
          }
          return acc
        }, {})

        Object.values(eodDeduplicated).forEach((r: any) => {
          const week = r.semana || 'S/N'
          if (!byWeek[week]) {
            byWeek[week] = {
              semana: week,
              agendamentos: 0,
              discoverys: 0,
              comparecimentos_discovery: 0,
              no_shows: 0,
              reagendadas: 0,
              follow_ups: 0,
              qas: 0,
              mqls: 0,
              sqls: 0,
              verbal_agreements: 0,
              leads_agendadas_eod: 0,
              leads_compareceram_eod: 0,
            }
          }
          byWeek[week].agendamentos += r.agendamentos || 0
          byWeek[week].leads_agendadas_eod += r.leads_agendadas || 0
          byWeek[week].leads_compareceram_eod += r.leads_compareceram || 0
        })

        setWeeklyData(Object.values(byWeek))
      }

      // 2. Buscar dados EOD para objetivos (mês atual)
      const currentMonth = new Date().toLocaleString('pt-PT', { month: 'long' }).toLowerCase()
      const currentYear = new Date().getFullYear()

      const { data: eodData } = await supabase
        .from('comercial_registos_eod')
        .select('*')
        .eq('ano', currentYear)
        .eq('mes', currentMonth)

      const { data: ppfMonthData } = await supabase
        .from('comercial_registos_ppf')
        .select('*')
        .eq('ano', currentYear)
        .eq('mes', currentMonth)
        .order('created_at', { ascending: false })

      if (eodData && ppfMonthData) {
        // 🔥 DEDUPLICAR PPF também para objetivos mensais
        const deduplicatedMonth = ppfMonthData.reduce((acc: any, r: any) => {
          const key = `${r.dia}_${r.closer}_${r.offer || 'null'}`
          if (!acc[key]) {
            acc[key] = r
          }
          return acc
        }, {})

        // Agregar totais do mês
        const totalChamadas = eodData.reduce((sum, r) => sum + (r.chamadas_efetuadas || 0), 0)
        const totalAgendamentosColdCalling = eodData
          .filter(r => r.canal_aquisicao === 'Cold Calling')
          .reduce((sum, r) => sum + (r.agendamentos || 0), 0)
        const totalAgendamentosOutros = eodData
          .filter(r => r.canal_aquisicao !== 'Cold Calling')
          .reduce((sum, r) => sum + (r.agendamentos || 0), 0)
        
        // ✅ MQLs vêm do PPF (campo mqls = total) - APÓS DEDUPLICAÇÃO
        const totalMQLs = Object.values(deduplicatedMonth).reduce((sum: number, r: any) => sum + (r.mqls || 0), 0)

        setObjetivosData({
          chamadas: totalChamadas,
          agendamentosColdCalling: totalAgendamentosColdCalling,
          agendamentosOutros: totalAgendamentosOutros,
          mqls: totalMQLs,
        })

        // Agregar por comercial
        const byComercial = eodData.reduce((acc: any, r: any) => {
          const comercial = r.comercial
          if (!acc[comercial]) {
            acc[comercial] = {
              comercial,
              chamadas: 0,
              agendamentosColdCalling: 0,
              agendamentosOutros: 0,
              mqls: 0,
            }
          }
          acc[comercial].chamadas += r.chamadas_efetuadas || 0
          if (r.canal_aquisicao === 'Cold Calling') {
            acc[comercial].agendamentosColdCalling += r.agendamentos || 0
          } else {
            acc[comercial].agendamentosOutros += r.agendamentos || 0
          }
          return acc
        }, {})

        // ✅ Adicionar MQLs por comercial de origem (campo mqls_comercial) - APÓS DEDUPLICAÇÃO
        Object.values(deduplicatedMonth).forEach((r: any) => {
          const comercialOrigem = r.comercial_origem
          if (comercialOrigem && byComercial[comercialOrigem]) {
            byComercial[comercialOrigem].mqls += r.mqls_comercial || 0
          }
        })

        setComercialObjetivos(Object.values(byComercial))
      }
    } catch (error) {
      console.error('Error loading growth data:', error)
    }

    setLoading(false)
  }

  if (loading) {
    return <LoadingState message="A carregar Growth KPIs..." />
  }

  // Definir objetivos/targets por semana
  const weeklyTargets = {
    agendamentos: 120,
    discoverys: 120,
    follow_ups: 72,
    qas: 60,
    mqls: 60,
    sqls: 20,
    verbal_agreements: 7,
    show_up_rate: 60.0, // 60%
  }

  // Objetivos Q4 e 2025
  const quarterlyTargets = {
    q4: {
      agendamentos: 140,
      discoverys: 120,
      mqls: 60,
      sqls: 20,
      verbal_agreements: 7,
      deals_closed: 6,
    },
    year: {
      agendamentos: 165,
      discoverys: 119,
      mqls: 60,
      sqls: 16,
      verbal_agreements: 11,
      deals_closed: 24,
    },
  }

  // Objetivos mensais (para os círculos)
  const monthlyTargets = {
    chamadas: 4100,
    agendamentos: 200, // Total (Cold Calling + Outros)
    agendamentosOutros: 20,
    mqls: 40,
  }

  // Objetivos por comercial
  const comercialTargets: any = {
    'David Gonçalves': { chamadas: 500, agendamentosColdCalling: 20, agendamentosOutros: 20, mqls: 10 },
    'Marcelo Lachev': { chamadas: 1200, agendamentosColdCalling: 40, agendamentosOutros: 40, mqls: 10 },
    'Daniela Gonçalves': { chamadas: 1200, agendamentosColdCalling: 40, agendamentosOutros: 40, mqls: 10 },
    'Alexandre Fernandes': { chamadas: 1200, agendamentosColdCalling: 0, agendamentosOutros: 0, mqls: 10 },
    'António Xia': { chamadas: 0, agendamentosColdCalling: 0, agendamentosOutros: 0, mqls: 0 },
  }

  return (
    <div className="space-y-8">
      {/* Header com Objetivos Gerais */}
      <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Growth KPIs</h2>
            <p className="text-sm text-gray-400">Objetivos vs Realizados • Q4 2025</p>
          </div>
        </div>

        {/* Comparação Q4 vs Ano */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Q4 - Outubro */}
          <div className="bg-dark-hover rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-cyan-400">Q4 • outubro</h3>
            </div>
            <div className="space-y-2 text-sm">
              {Object.entries(quarterlyTargets.q4).map(([key, target]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">objetivo:</span>
                    <span className="font-bold text-cyan-400">{target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2025 Completo */}
          <div className="bg-dark-hover rounded-lg p-4 border border-success/30">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-success" />
              <h3 className="font-bold text-success">2025 • Ano Completo</h3>
            </div>
            <div className="space-y-2 text-sm">
              {Object.entries(quarterlyTargets.year).map(([key, target]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">objetivo:</span>
                    <span className="font-bold text-success">{target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 📊 SECÇÃO DE OBJETIVOS MENSAIS */}
      {objetivosData && (
        <div className="card bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/30">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-success" />
            <div>
              <h2 className="text-2xl font-bold">Objetivos • {new Date().toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</h2>
              <p className="text-sm text-gray-400">Progresso mensal da equipa</p>
            </div>
          </div>

          {/* Círculos de Progresso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-8 max-w-3xl mx-auto">
            <CircularProgress
              value={objetivosData.chamadas}
              max={monthlyTargets.chamadas}
              label="Chamadas"
              color={COLORS.cyan}
              size={160}
            />
            <CircularProgress
              value={objetivosData.agendamentosColdCalling + objetivosData.agendamentosOutros}
              max={monthlyTargets.agendamentos}
              label="Agendamentos"
              color={COLORS.success}
              size={160}
            />
          </div>

          {/* Tabela por Comercial */}
          {comercialObjetivos.length > 0 && (
            <>
              <h3 className="text-lg font-bold mb-4 text-gray-300">Performance por Comercial</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4">Comercial</th>
                          <th className="text-center py-3 px-4">Chamadas</th>
                          <th className="text-center py-3 px-4">Agendamentos (Cold calls)</th>
                          <th className="text-center py-3 px-4">Agendamentos (Outros)</th>
                        </tr>
                      </thead>
                  <tbody>
                    {comercialObjetivos
                      .sort((a, b) => (b.chamadas + b.agendamentosColdCalling) - (a.chamadas + a.agendamentosColdCalling))
                      .map((com, idx) => {
                        const targets = comercialTargets[com.comercial] || {}
                        const chamadasPercent = targets.chamadas > 0 ? (com.chamadas / targets.chamadas * 100).toFixed(0) : '-'
                        const agendCCPercent = targets.agendamentosColdCalling > 0 ? (com.agendamentosColdCalling / targets.agendamentosColdCalling * 100).toFixed(0) : '-'
                        const agendOutrosPercent = targets.agendamentosOutros > 0 ? (com.agendamentosOutros / targets.agendamentosOutros * 100).toFixed(0) : '-'
                        
                        return (
                          <tr key={idx} className={`border-b border-gray-800 ${idx < 3 ? 'bg-cyan-500/5' : ''}`}>
                            <td className="py-3 px-4 font-semibold">{com.comercial}</td>
                            <td className="text-center py-3 px-4">
                              <div className="font-bold">{com.chamadas}</div>
                              <div className="text-xs text-gray-400">
                                / {targets.chamadas || 0} • {chamadasPercent !== '-' ? `${chamadasPercent}%` : '-'}
                              </div>
                            </td>
                            <td className="text-center py-3 px-4">
                              <div className="font-bold text-success">{com.agendamentosColdCalling}</div>
                              <div className="text-xs text-gray-400">
                                / {targets.agendamentosColdCalling || 0} • {agendCCPercent !== '-' ? `${agendCCPercent}%` : '-'}
                              </div>
                            </td>
                            <td className="text-center py-3 px-4">
                              <div className="font-bold text-warning">{com.agendamentosOutros}</div>
                              <div className="text-xs text-gray-400">
                                / {targets.agendamentosOutros || 0} • {agendOutrosPercent !== '-' ? `${agendOutrosPercent}%` : '-'}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabela de Pipeline Semanal */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Pipeline Semanal • Semana a Semana
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 sticky left-0 bg-dark-card">Pipeline</th>
                {weeklyData.map((week) => (
                  <th key={week.semana} className="text-center py-3 px-3 min-w-[100px]">
                    <div className="text-sm font-bold">Semana {week.semana}</div>
                  </th>
                ))}
                <th className="text-center py-3 px-3 bg-cyan-500/10 min-w-[100px]">
                  <div className="text-sm font-bold text-cyan-400">outubro</div>
                  <div className="text-xs text-gray-400">objetivo</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Total de Agendamentos */}
              <tr className="border-b border-gray-800 bg-cyan-500/5">
                <td className="py-3 px-4 font-semibold text-cyan-400 sticky left-0 bg-dark-card">
                  Total de Agendamentos
                </td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    <div className="font-bold">{week.agendamentos}</div>
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10">
                  <div className="font-bold text-cyan-400">{quarterlyTargets.q4.agendamentos}</div>
                </td>
              </tr>

              {/* Discoverys */}
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 sticky left-0 bg-dark-card">Discoverys</td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    {week.discoverys}
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10 text-cyan-400">
                  {weeklyTargets.discoverys}
                </td>
              </tr>

              {/* Comparecimentos */}
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 sticky left-0 bg-dark-card">Comparecimentos</td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    {week.comparecimentos_discovery}
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10"></td>
              </tr>

              {/* No-shows */}
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 sticky left-0 bg-dark-card">No-shows</td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3 text-danger">
                    {week.no_shows}
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10"></td>
              </tr>

              {/* Reagendadas */}
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 sticky left-0 bg-dark-card">Reagendadas</td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3 text-warning">
                    {week.reagendadas}
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10"></td>
              </tr>

              {/* Show up rate */}
              <tr className="border-b border-gray-800 bg-success/5">
                <td className="py-3 px-4 font-semibold text-success sticky left-0 bg-dark-card">
                  Show up rate
                </td>
                {weeklyData.map((week) => {
                  // 🔥 USAR DADOS DO EOD: leads_compareceram / leads_agendadas
                  const rate = week.leads_agendadas_eod > 0 
                    ? ((week.leads_compareceram_eod / week.leads_agendadas_eod) * 100).toFixed(1)
                    : '0.0'
                  return (
                    <td key={week.semana} className="text-center py-3 px-3">
                      <span className="font-bold text-success">{rate}%</span>
                    </td>
                  )
                })}
                <td className="text-center py-3 px-3 bg-cyan-500/10">
                  <span className="font-bold text-cyan-400">{weeklyTargets.show_up_rate}%</span>
                </td>
              </tr>

              {/* Follow ups */}
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 sticky left-0 bg-dark-card">Follow ups</td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    {week.follow_ups}
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10 text-cyan-400">
                  {weeklyTargets.follow_ups}
                </td>
              </tr>

              {/* Q&As */}
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 sticky left-0 bg-dark-card">Q&A's</td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    {week.qas}
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10 text-cyan-400">
                  {weeklyTargets.qas}
                </td>
              </tr>

              {/* MQLs */}
              <tr className="border-b border-gray-800 bg-yellow-500/5">
                <td className="py-3 px-4 font-semibold sticky left-0 bg-dark-card">MQL's</td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    <span className="font-bold">{week.mqls}</span>
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10">
                  <span className="font-bold text-cyan-400">{weeklyTargets.mqls}</span>
                </td>
              </tr>

              {/* SQLs */}
              <tr className="border-b border-gray-800 bg-primary/5">
                <td className="py-3 px-4 font-semibold text-primary sticky left-0 bg-dark-card">
                  SQL's
                </td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    <span className="font-bold text-primary">{week.sqls}</span>
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10">
                  <span className="font-bold text-cyan-400">{weeklyTargets.sqls}</span>
                </td>
              </tr>

              {/* Verbal Agreements */}
              <tr className="border-b border-gray-800 bg-success/5">
                <td className="py-3 px-4 font-semibold text-success sticky left-0 bg-dark-card">
                  Verbal Agreements
                </td>
                {weeklyData.map((week) => (
                  <td key={week.semana} className="text-center py-3 px-3">
                    <span className="font-bold text-success text-lg">{week.verbal_agreements}</span>
                  </td>
                ))}
                <td className="text-center py-3 px-3 bg-cyan-500/10">
                  <span className="font-bold text-cyan-400 text-lg">{weeklyTargets.verbal_agreements}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota de Dados */}
      <div className="card bg-primary/10 border border-primary/30">
        <div className="text-sm text-gray-300">
          💡 <strong>Nota:</strong> Os dados são calculados automaticamente a partir dos registos PPF no Supabase. 
          Os objetivos podem ser ajustados conforme necessário.
        </div>
      </div>
    </div>
  )
}

