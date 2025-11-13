import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getRegistos } from '@/lib/queries'
import { type Filters as FilterType } from '@/lib/supabase'
import Filters from '@/components/Filters'
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import { Target, Phone, Megaphone, Mail } from 'lucide-react'

export default function Funil() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
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
    getRegistos(filters).then((data) => {
      setRegistos(data)
      setLoading(false)
    })
  }, [searchParams])

  if (loading) {
    return <LoadingState message="A carregar funis..." />
  }

  // Separate by channel and calculate funnels
  const coldCallingData = registos.filter(r => r.canal_aquisicao === 'Cold Calling')
  const anunciosData = registos.filter(r => r.canal_aquisicao === 'Anúncios')
  const emailMarketingData = registos.filter(r => r.canal_aquisicao === 'Email Marketing')

  // Cold Calling Funnel
  const ccFunnel = coldCallingData.reduce((acc, r) => ({
    chamadas: acc.chamadas + r.chamadas_efetuadas,
    atendidas: acc.atendidas + r.chamadas_atendidas,
    decisores: acc.decisores + r.decisores_qualificados,
    agendamentos: acc.agendamentos + r.agendamentos,
  }), { chamadas: 0, atendidas: 0, decisores: 0, agendamentos: 0 })

  // Anúncios Funnel
  const adsFunnel = anunciosData.reduce((acc, r) => ({
    submissoes: acc.submissoes + r.submissoes,
    atenderam: acc.atenderam + r.leads_atenderam,
    agendamentos: acc.agendamentos + r.agendamentos,
    showups: acc.showups + r.leads_compareceram,
  }), { submissoes: 0, atenderam: 0, agendamentos: 0, showups: 0 })

  // Email Funnel
  const emailFunnel = emailMarketingData.reduce((acc, r) => ({
    mensagens: acc.mensagens + r.mensagens_emails_referencias,
    respostas: acc.respostas + r.respostas,
    qualificadas: acc.qualificadas + r.respostas_qualificadas,
    agendamentos: acc.agendamentos + r.agendamentos,
  }), { mensagens: 0, respostas: 0, qualificadas: 0, agendamentos: 0 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8" />
            Funis de Conversão
          </h2>
          <p className="text-sm text-gray-400 mt-1">Cada canal tem seu próprio funil</p>
        </div>
      </div>

      <QuickPeriodSelector />
      <Filters />

      {/* Cold Calling Funnel */}
      {coldCallingData.length > 0 && (
        <div className="card border-blue-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-400" />
            Funil Cold Calling
          </h3>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Chamadas', value: ccFunnel.chamadas, icon: '📞' },
              { label: 'Atendidas', value: ccFunnel.atendidas, icon: '👂', pct: ccFunnel.chamadas > 0 ? (ccFunnel.atendidas / ccFunnel.chamadas * 100).toFixed(0) : 0 },
              { label: 'Decisores Qual.', value: ccFunnel.decisores, icon: '🎯', pct: ccFunnel.atendidas > 0 ? (ccFunnel.decisores / ccFunnel.atendidas * 100).toFixed(0) : 0 },
              { label: 'Agendamentos', value: ccFunnel.agendamentos, icon: '✅', pct: ccFunnel.decisores > 0 ? (ccFunnel.agendamentos / ccFunnel.decisores * 100).toFixed(0) : 0 },
            ].map((stage, idx) => (
              <div key={stage.label} className="relative">
                <div className="bg-blue-500/10 border-2 border-blue-500/40 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{stage.icon}</div>
                  <div className="text-3xl font-bold">{stage.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stage.label}</div>
                  {stage.pct && (
                    <div className="text-xs text-blue-400 mt-2 font-semibold">
                      {stage.pct}% conversão
                    </div>
                  )}
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-600 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-dark-hover rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Conversão Global</div>
            <div className="text-2xl font-bold text-success">
              {ccFunnel.chamadas > 0 ? ((ccFunnel.agendamentos / ccFunnel.chamadas) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              De {ccFunnel.chamadas} chamadas para {ccFunnel.agendamentos} agendamentos
            </div>
          </div>
        </div>
      )}

      {/* Anúncios Funnel */}
      {anunciosData.length > 0 && (
        <div className="card border-orange-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-400" />
            Funil Anúncios
          </h3>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Submissões', value: adsFunnel.submissoes, icon: '📋' },
              { label: 'Atenderam', value: adsFunnel.atenderam, icon: '📞', pct: adsFunnel.submissoes > 0 ? (adsFunnel.atenderam / adsFunnel.submissoes * 100).toFixed(0) : 0 },
              { label: 'Agendamentos', value: adsFunnel.agendamentos, icon: '📅', pct: adsFunnel.atenderam > 0 ? (adsFunnel.agendamentos / adsFunnel.atenderam * 100).toFixed(0) : 0 },
              { label: 'Show-ups', value: adsFunnel.showups, icon: '✅', pct: adsFunnel.agendamentos > 0 ? (adsFunnel.showups / adsFunnel.agendamentos * 100).toFixed(0) : 0 },
            ].map((stage, idx) => (
              <div key={stage.label} className="relative">
                <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{stage.icon}</div>
                  <div className="text-3xl font-bold">{stage.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stage.label}</div>
                  {stage.pct && (
                    <div className="text-xs text-orange-400 mt-2 font-semibold">
                      {stage.pct}% conversão
                    </div>
                  )}
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-600 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-dark-hover rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Conversão Global (Submissão → Show-up)</div>
            <div className="text-2xl font-bold text-success">
              {adsFunnel.submissoes > 0 ? ((adsFunnel.showups / adsFunnel.submissoes) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              De {adsFunnel.submissoes} submissões para {adsFunnel.showups} show-ups
            </div>
          </div>
        </div>
      )}

      {/* Email Marketing Funnel */}
      {emailMarketingData.length > 0 && (
        <div className="card border-cyan-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Funil Email Marketing
          </h3>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Mensagens', value: emailFunnel.mensagens, icon: '✉️' },
              { label: 'Respostas', value: emailFunnel.respostas, icon: '💬', pct: emailFunnel.mensagens > 0 ? (emailFunnel.respostas / emailFunnel.mensagens * 100).toFixed(0) : 0 },
              { label: 'Qualificadas', value: emailFunnel.qualificadas, icon: '⭐', pct: emailFunnel.respostas > 0 ? (emailFunnel.qualificadas / emailFunnel.respostas * 100).toFixed(0) : 0 },
              { label: 'Agendamentos', value: emailFunnel.agendamentos, icon: '✅', pct: emailFunnel.qualificadas > 0 ? (emailFunnel.agendamentos / emailFunnel.qualificadas * 100).toFixed(0) : 0 },
            ].map((stage, idx) => (
              <div key={stage.label} className="relative">
                <div className="bg-cyan-500/10 border-2 border-cyan-500/40 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{stage.icon}</div>
                  <div className="text-3xl font-bold">{stage.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stage.label}</div>
                  {stage.pct && (
                    <div className="text-xs text-cyan-400 mt-2 font-semibold">
                      {stage.pct}% conversão
                    </div>
                  )}
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-600 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-dark-hover rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Conversão Global</div>
            <div className="text-2xl font-bold text-success">
              {emailFunnel.mensagens > 0 ? ((emailFunnel.agendamentos / emailFunnel.mensagens) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              De {emailFunnel.mensagens} mensagens para {emailFunnel.agendamentos} agendamentos
            </div>
          </div>
        </div>
      )}

      {registos.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          Sem dados disponíveis para os filtros selecionados
        </div>
      )}
    </div>
  )
}
