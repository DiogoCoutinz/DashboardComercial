import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import LoadingState from '@/components/LoadingState'
import { TrendingUp, Target, Calendar, Award } from 'lucide-react'
import { COLORS } from '@/lib/constants'

export default function GrowthKPIs() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [monthlyRecords, setMonthlyRecords] = useState<any>(null)

  useEffect(() => {
    loadGrowthData()
  }, [searchParams])

  const loadGrowthData = async () => {
    setLoading(true)
    
    // Aqui vamos buscar dados agregados por semana do PPF
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      // Buscar dados PPF agregados por semana
      const { data: ppfData } = await supabase
        .from('comercial_registos_ppf')
        .select('*')
        .gte('dia', '2025-10-01') // Q4 2025
        .order('semana', { ascending: true })

      if (ppfData) {
        // Agrupar por semana
        const byWeek = ppfData.reduce((acc: any, r: any) => {
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
          acc[week].agendamentos += r.leads_agendadas_discovery || 0
          acc[week].discoverys += r.discoverys || 0
          acc[week].comparecimentos_discovery += r.comparecimentos_discovery || 0
          acc[week].no_shows += (r.discoverys_no_shows || 0) + (r.follow_ups_no_shows || 0) + (r.qas_no_shows || 0)
          acc[week].reagendadas += (r.discoverys_reagendadas || 0) + (r.follow_ups_reagendadas || 0) + (r.qas_reagendadas || 0)
          acc[week].follow_ups += r.follow_ups || 0
          acc[week].qas += r.qas || 0
          acc[week].mqls += r.mqls || 0
          acc[week].sqls += r.sqls || 0
          acc[week].verbal_agreements += r.verbal_agreements || 0
          return acc
        }, {})

        setWeeklyData(Object.values(byWeek))
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

  return (
    <div className="space-y-6">
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
                  const rate = week.discoverys > 0 
                    ? ((week.comparecimentos_discovery / week.discoverys) * 100).toFixed(1)
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

