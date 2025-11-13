import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGlobalKPIs, getDataByDay, getDataByComercial, getDataByCanal, getRegistos } from '@/lib/queries'
import { type Filters as FilterType } from '@/lib/supabase'
import MonthTrend from '@/components/MonthTrend'
import SimpleBarChart from '@/components/SimpleBarChart'
import Filters from '@/components/Filters'
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import { Phone, Users, Calendar, Target, Mail, Megaphone, UserPlus } from 'lucide-react'
import { COLORS } from '@/lib/constants'

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<any>(null)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [comercialData, setComercialData] = useState<any[]>([])
  const [canalData, setCanalData] = useState<any[]>([])
  const [registos, setRegistos] = useState<any[]>([])

  useEffect(() => {
    const filters: FilterType = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      comerciais: searchParams.get('comerciais')?.split(',').filter(Boolean),
      canais: searchParams.get('canais')?.split(',').filter(Boolean),
      offers: searchParams.get('offers')?.split(',').filter(Boolean),
      ano: searchParams.get('ano') ? Number(searchParams.get('ano')) : undefined,
      trimestre: searchParams.get('trimestre') || undefined,
      mes: searchParams.get('mes') || undefined,
    }

    setLoading(true)
    Promise.all([
      getGlobalKPIs(filters),
      getDataByDay(filters),
      getDataByComercial(filters),
      getDataByCanal(filters),
      getRegistos(filters),
    ]).then(([kpisData, daily, comercial, canal, regs]) => {
      setKpis(kpisData)
      setDailyData(daily)
      setComercialData(comercial)
      setCanalData(canal)
      setRegistos(regs)
      setLoading(false)
    })
  }, [searchParams])

  if (loading) {
    return <LoadingState message="A carregar dados comerciais..." />
  }

  if (!kpis) {
    return <LoadingState message="Sem dados disponíveis" />
  }

  // Separate KPIs by channel type
  const coldCallingData = registos.filter(r => r.canal_aquisicao === 'Cold Calling')
  const anunciosData = registos.filter(r => r.canal_aquisicao === 'Anúncios')
  const emailMarketingData = registos.filter(r => r.canal_aquisicao === 'Email Marketing')
  const referenciasData = registos.filter(r => r.canal_aquisicao === 'Referências')

  const coldCallingKPIs = coldCallingData.reduce((acc, r) => ({
    chamadas: acc.chamadas + r.chamadas_efetuadas,
    atendidas: acc.atendidas + r.chamadas_atendidas,
    decisores: acc.decisores + r.decisores_qualificados,
    agendamentos: acc.agendamentos + r.agendamentos,
  }), { chamadas: 0, atendidas: 0, decisores: 0, agendamentos: 0 })

  const anunciosKPIs = anunciosData.reduce((acc, r) => ({
    submissoes: acc.submissoes + r.submissoes,
    leadsAtenderam: acc.leadsAtenderam + r.leads_atenderam,
    agendamentos: acc.agendamentos + r.agendamentos,
    showups: acc.showups + r.leads_compareceram,
  }), { submissoes: 0, leadsAtenderam: 0, agendamentos: 0, showups: 0 })

  const emailKPIs = emailMarketingData.reduce((acc, r) => ({
    mensagens: acc.mensagens + r.mensagens_emails_referencias,
    respostas: acc.respostas + r.respostas,
    respostasQual: acc.respostasQual + r.respostas_qualificadas,
    agendamentos: acc.agendamentos + r.agendamentos,
  }), { mensagens: 0, respostas: 0, respostasQual: 0, agendamentos: 0 })

  const referenciasKPIs = referenciasData.reduce((acc, r) => ({
    mensagens: acc.mensagens + r.mensagens_emails_referencias,
    respostas: acc.respostas + r.respostas,
    respostasQual: acc.respostasQual + r.respostas_qualificadas,
  }), { mensagens: 0, respostas: 0, respostasQual: 0 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
          <h2 className="text-3xl font-bold">Dashboard Comercial</h2>
          <p className="text-sm text-gray-400 mt-1">Performance em tempo real da equipa BoomLab</p>
        </div>
      </div>

      {/* Quick Period Selector */}
      <QuickPeriodSelector />
      <Filters />

      {/* 🔥 KPIs UNIVERSAIS - O QUE É COMUM A TODOS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <div className="flex items-center gap-2 text-xs text-green-300 mb-2">
            <Calendar className="w-4 h-4" />
            Total Agendamentos
          </div>
          <div className="text-5xl font-bold">{kpis.agendamentos}</div>
          <div className="text-xs text-gray-400 mt-2">
            Todas as fontes
          </div>
      </div>

        <div className="card bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
            <Users className="w-4 h-4" />
            Show-ups
          </div>
          <div className="text-5xl font-bold">{kpis.leads_compareceram}</div>
          <div className="text-xs text-gray-400 mt-2">
            Taxa: {kpis.taxaShowUp.toFixed(1)}%
          </div>
      </div>

        <div className="card bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <div className="flex items-center gap-2 text-xs text-purple-300 mb-2">
            <Target className="w-4 h-4" />
            Leads Agendadas
          </div>
          <div className="text-5xl font-bold">{kpis.leads_agendadas}</div>
          <div className="text-xs text-gray-400 mt-2">
            Para futuro
          </div>
        </div>
      </div>

      {/* 📞 COLD CALLING */}
      {coldCallingData.length > 0 && (
        <div className="card border-blue-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-400" />
            Cold Calling
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Chamadas</div>
              <div className="text-3xl font-bold">{coldCallingKPIs.chamadas}</div>
              <div className="text-xs text-gray-500 mt-1">
                Atendidas: {coldCallingKPIs.atendidas} ({coldCallingKPIs.chamadas > 0 ? ((coldCallingKPIs.atendidas / coldCallingKPIs.chamadas) * 100).toFixed(0) : 0}%)
              </div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Decisores Qualificados</div>
              <div className="text-3xl font-bold">{coldCallingKPIs.decisores}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Agendamentos</div>
              <div className="text-3xl font-bold text-success">{coldCallingKPIs.agendamentos}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Taxa Conversão</div>
              <div className="text-3xl font-bold text-primary">
                {coldCallingKPIs.chamadas > 0 ? ((coldCallingKPIs.agendamentos / coldCallingKPIs.chamadas) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📢 ANÚNCIOS */}
      {anunciosData.length > 0 && (
        <div className="card border-orange-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-400" />
            Anúncios (Ads)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Submissões</div>
              <div className="text-3xl font-bold">{anunciosKPIs.submissoes}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Leads Atenderam</div>
              <div className="text-3xl font-bold">{anunciosKPIs.leadsAtenderam}</div>
              <div className="text-xs text-gray-500 mt-1">
                {anunciosKPIs.submissoes > 0 ? ((anunciosKPIs.leadsAtenderam / anunciosKPIs.submissoes) * 100).toFixed(0) : 0}% das submissões
              </div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Agendamentos</div>
              <div className="text-3xl font-bold text-success">{anunciosKPIs.agendamentos}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Show-ups</div>
              <div className="text-3xl font-bold text-warning">{anunciosKPIs.showups}</div>
            </div>
          </div>
        </div>
      )}

      {/* 📧 EMAIL MARKETING */}
      {emailMarketingData.length > 0 && (
        <div className="card border-cyan-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Email Marketing
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Mensagens Enviadas</div>
              <div className="text-3xl font-bold">{emailKPIs.mensagens}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Respostas</div>
              <div className="text-3xl font-bold">{emailKPIs.respostas}</div>
              <div className="text-xs text-gray-500 mt-1">
                Qualificadas: {emailKPIs.respostasQual}
              </div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Taxa Resposta</div>
              <div className="text-3xl font-bold text-primary">
                {emailKPIs.mensagens > 0 ? ((emailKPIs.respostas / emailKPIs.mensagens) * 100).toFixed(0) : 0}%
              </div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Agendamentos</div>
              <div className="text-3xl font-bold text-success">{emailKPIs.agendamentos}</div>
            </div>
          </div>
        </div>
      )}

      {/* 👥 REFERÊNCIAS */}
      {referenciasData.length > 0 && (
        <div className="card border-pink-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-pink-400" />
            Referências
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Mensagens</div>
              <div className="text-3xl font-bold">{referenciasKPIs.mensagens}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Respostas</div>
              <div className="text-3xl font-bold">{referenciasKPIs.respostas}</div>
            </div>
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Qualificadas</div>
              <div className="text-3xl font-bold text-success">{referenciasKPIs.respostasQual}</div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Temporal */}
        {dailyData.length > 0 && (
          <MonthTrend
            data={dailyData.map(d => ({ mes: d.dia, valor: d.agendamentos }))}
            title="📈 Agendamentos por Dia"
          />
        )}

        {/* Top Comerciais */}
        {comercialData.length > 0 && (
          <SimpleBarChart
            data={comercialData.slice(0, 5).map(c => ({
              name: c.comercial,
              agendamentos: c.agendamentos,
              showups: c.leads_compareceram,
            }))}
            title="🏆 Top Comerciais"
            dataKeys={[
              { key: 'agendamentos', label: 'Agendamentos', color: COLORS.success },
              { key: 'showups', label: 'Show-ups', color: COLORS.warning },
            ]}
          />
        )}
      </div>

      {/* Performance por Canal - Tabela Resumo */}
      {canalData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">📊 Resumo por Canal</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Canal</th>
                  <th className="text-right">Agendamentos</th>
                  <th className="text-right">Show-ups</th>
                  <th className="text-right">Taxa Show-Up</th>
                </tr>
              </thead>
              <tbody>
                {canalData.map((canal) => (
                  <tr key={canal.canal}>
                    <td className="font-medium">{canal.canal}</td>
                    <td className="text-right">{canal.agendamentos}</td>
                    <td className="text-right">{canal.leads_compareceram}</td>
                    <td className="text-right">
                      {canal.agendamentos > 0 
                        ? `${((canal.leads_compareceram / canal.agendamentos) * 100).toFixed(1)}%`
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
