import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGlobalKPIs, getDataByDay, getDataByComercial, getDataByCanal, getRegistos } from '@/lib/queries'
import { type Filters as FilterType } from '@/lib/supabase'
import MonthTrend from '@/components/MonthTrend'
import SimpleBarChart from '@/components/SimpleBarChart'
import PieChart from '@/components/PieChart'
import Filters from '@/components/Filters'
import FilterModal from '@/components/FilterModal'
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import { Phone, Users, Calendar, Target, Mail, Megaphone, UserPlus, TrendingUp, CheckCircle, Filter } from 'lucide-react'
import { COLORS } from '@/lib/constants'

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<any>(null)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [comercialData, setComercialData] = useState<any[]>([])
  const [canalData, setCanalData] = useState<any[]>([])
  const [registos, setRegistos] = useState<any[]>([])
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

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

  // Calculate quality metrics
  const totalDecisoresAbordados = registos.reduce((sum, r) => sum + r.decisores_abordados, 0)
  const totalDecisoresQualificados = registos.reduce((sum, r) => sum + r.decisores_qualificados, 0)
  const taxaQualificacao = totalDecisoresAbordados > 0 
    ? (totalDecisoresQualificados / totalDecisoresAbordados) * 100 
    : 0

  // Calculate overall conversion (Show-ups / Total Leads)
  const totalLeadsSubmetidas = kpis.submissoes + kpis.mensagens_emails_referencias
  const taxaConversaoGeral = totalLeadsSubmetidas > 0 
    ? (kpis.leads_compareceram / totalLeadsSubmetidas) * 100 
    : 0

  // Prepare distribution data for pie chart
  const distributionData = canalData
    .filter(c => c.agendamentos > 0)
    .map(c => {
      let color = COLORS.gray
      if (c.canal === 'Cold Calling') color = COLORS.primary
      else if (c.canal === 'Anúncios') color = COLORS.warning
      else if (c.canal === 'Email Marketing') color = COLORS.cyan
      else if (c.canal === 'Referências') color = COLORS.pink
      return {
        name: c.canal,
        value: c.agendamentos,
        color,
      }
    })

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
        <Filters />
      </FilterModal>

      {/* 🔥 BIG CARDS - KPIs PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Agendamentos Totais */}
        <div className="card bg-gradient-to-br from-success/30 to-success/10 border-2 border-success/50 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-success" />
            <TrendingUp className="w-5 h-5 text-success/60" />
          </div>
          <div className="text-sm text-gray-300 mb-1">Agendamentos</div>
          <div className="text-5xl font-bold text-success mb-2">{kpis.agendamentos}</div>
          <div className="text-xs text-gray-400">Todas as fontes</div>
        </div>

        {/* Show-ups */}
        <div className="card bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-primary" />
            <Users className="w-5 h-5 text-primary/60" />
          </div>
          <div className="text-sm text-gray-300 mb-1">Show-ups</div>
          <div className="text-5xl font-bold text-primary mb-2">{kpis.leads_compareceram}</div>
          <div className="text-xs text-gray-400">Compareceram</div>
        </div>

        {/* Taxa Comparecimento */}
        <div className="card bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 border-2 border-cyan-500/50 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-cyan-400" />
            <div className="text-xs text-cyan-300">Show-up Rate</div>
          </div>
          <div className="text-sm text-gray-300 mb-1">Taxa Comparecência</div>
          <div className="text-5xl font-bold text-cyan-400 mb-2">{kpis.taxaShowUp.toFixed(0)}%</div>
          <div className="text-xs text-gray-400">{kpis.leads_compareceram}/{kpis.agendamentos}</div>
        </div>

        {/* Leads Submetidas */}
        <div className="card bg-gradient-to-br from-warning/30 to-warning/10 border-2 border-warning/50 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Mail className="w-8 h-8 text-warning" />
            <Megaphone className="w-5 h-5 text-warning/60" />
          </div>
          <div className="text-sm text-gray-300 mb-1">Leads Submetidas</div>
          <div className="text-5xl font-bold text-warning mb-2">{totalLeadsSubmetidas}</div>
          <div className="text-xs text-gray-400">Ads + Email</div>
        </div>

        {/* Taxa Conversão Geral */}
        <div className="card bg-gradient-to-br from-purple-500/30 to-purple-600/10 border-2 border-purple-500/50 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div className="text-xs text-purple-300">Conversão</div>
          </div>
          <div className="text-sm text-gray-300 mb-1">Taxa Conversão Geral</div>
          <div className="text-5xl font-bold text-purple-400 mb-2">{taxaConversaoGeral.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Show-ups/Leads</div>
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

      {/* 📊 DISTRIBUIÇÃO & QUALIDADE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Canal */}
        {distributionData.length > 0 && (
          <PieChart
            data={distributionData}
            title="📊 Distribuição de Agendamentos por Canal"
            innerRadius={70}
          />
        )}

        {/* Métricas de Qualidade */}
        <div className="card border-success/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-success" />
            Métricas de Qualidade
          </h3>
          
          <div className="space-y-4">
            {/* Decisores */}
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Decisores</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Cold Calling</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Abordados</div>
                  <div className="text-2xl font-bold">{totalDecisoresAbordados}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Qualificados</div>
                  <div className="text-2xl font-bold text-success">{totalDecisoresQualificados}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Taxa de Qualificação</span>
                  <span className="text-lg font-bold text-primary">{taxaQualificacao.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Respostas Qualificadas */}
            <div className="bg-dark-hover rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Email & Referências</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">Outbound</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Mensagens Enviadas</div>
                  <div className="text-2xl font-bold">{emailKPIs.mensagens + referenciasKPIs.mensagens}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Respostas Qualificadas</div>
                  <div className="text-2xl font-bold text-success">{emailKPIs.respostasQual + referenciasKPIs.respostasQual}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Taxa de Resposta</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {emailKPIs.mensagens + referenciasKPIs.mensagens > 0 
                      ? ((emailKPIs.respostas + referenciasKPIs.respostas) / (emailKPIs.mensagens + referenciasKPIs.mensagens) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tempo Médio de Resposta */}
            {kpis.tempoMedioResposta > 0 && (
              <div className="bg-dark-hover rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Tempo Médio de Resposta</span>
                  <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">Ads</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning">{kpis.tempoMedioResposta.toFixed(0)}h</div>
                  <div className="text-xs text-gray-500 mt-1">Tempo até contacto</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos de Performance */}
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
