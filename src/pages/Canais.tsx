import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getRegistos } from '@/lib/queries'
import { type Filters as FilterType } from '@/lib/supabase'
import Filters from '@/components/Filters'
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import DataTable from '@/components/DataTable'
import { Wifi, Phone, Megaphone, Mail, UserPlus } from 'lucide-react'

export default function Canais() {
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
    return <LoadingState message="A carregar dados dos canais..." />
  }

  // Separate by channel
  const coldCallingData = registos.filter(r => r.canal_aquisicao === 'Cold Calling')
  const anunciosData = registos.filter(r => r.canal_aquisicao === 'Anúncios')
  const emailMarketingData = registos.filter(r => r.canal_aquisicao === 'Email Marketing')
  const referenciasData = registos.filter(r => r.canal_aquisicao === 'Referências')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Wifi className="w-8 h-8" />
            Análise por Canal
          </h2>
          <p className="text-sm text-gray-400 mt-1">Métricas específicas de cada canal de aquisição</p>
        </div>
      </div>

      <QuickPeriodSelector />
      <Filters />

      {/* Cold Calling */}
      {coldCallingData.length > 0 && (
        <div className="card border-blue-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-400" />
            Cold Calling ({coldCallingData.length} registos)
          </h3>
          <DataTable
            data={coldCallingData.map(r => ({
              dia: r.dia,
              comercial: r.comercial,
              offer: r.offer || 'N/A',
              chamadas_efetuadas: r.chamadas_efetuadas,
              chamadas_atendidas: r.chamadas_atendidas,
              decisores_qualificados: r.decisores_qualificados,
              agendamentos: r.agendamentos,
              taxa_atend: r.chamadas_efetuadas > 0 
                ? `${((r.chamadas_atendidas / r.chamadas_efetuadas) * 100).toFixed(0)}%`
                : '-',
            }))}
            columns={[
              { key: 'dia', label: 'Data', sortable: true },
              { key: 'comercial', label: 'Comercial', sortable: true },
              { key: 'offer', label: 'Offer', sortable: true },
              { key: 'chamadas_efetuadas', label: 'Chamadas', format: 'number', sortable: true },
              { key: 'chamadas_atendidas', label: 'Atendidas', format: 'number', sortable: true },
              { key: 'taxa_atend', label: 'Taxa', sortable: false },
              { key: 'decisores_qualificados', label: 'Decisores Qual.', format: 'number', sortable: true },
              { key: 'agendamentos', label: 'Agendamentos', format: 'number', sortable: true },
            ]}
            exportFilename="cold-calling-detalhado"
            pageSize={20}
          />
        </div>
      )}

      {/* Anúncios */}
      {anunciosData.length > 0 && (
        <div className="card border-orange-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-400" />
            Anúncios ({anunciosData.length} registos)
          </h3>
          <DataTable
            data={anunciosData.map(r => ({
              dia: r.dia,
              comercial: r.comercial,
              offer: r.offer || 'N/A',
              submissoes: r.submissoes,
              leads_atenderam: r.leads_atenderam,
              tempo_resposta: r.tempo_medio_resposta || '-',
              agendamentos: r.agendamentos,
              leads_compareceram: r.leads_compareceram,
              taxa_showup: r.agendamentos > 0
                ? `${((r.leads_compareceram / r.agendamentos) * 100).toFixed(0)}%`
                : '-',
            }))}
            columns={[
              { key: 'dia', label: 'Data', sortable: true },
              { key: 'comercial', label: 'Comercial', sortable: true },
              { key: 'offer', label: 'Offer', sortable: true },
              { key: 'submissoes', label: 'Submissões', format: 'number', sortable: true },
              { key: 'leads_atenderam', label: 'Leads Atend.', format: 'number', sortable: true },
              { key: 'tempo_resposta', label: 'Tempo Resp. (dias)', sortable: true },
              { key: 'agendamentos', label: 'Agendamentos', format: 'number', sortable: true },
              { key: 'leads_compareceram', label: 'Show-ups', format: 'number', sortable: true },
              { key: 'taxa_showup', label: 'Taxa Show-Up', sortable: false },
            ]}
            exportFilename="anuncios-detalhado"
            pageSize={20}
          />
        </div>
      )}

      {/* Email Marketing */}
      {emailMarketingData.length > 0 && (
        <div className="card border-cyan-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Email Marketing ({emailMarketingData.length} registos)
          </h3>
          <DataTable
            data={emailMarketingData.map(r => ({
              dia: r.dia,
              comercial: r.comercial,
              offer: r.offer || 'N/A',
              mensagens: r.mensagens_emails_referencias,
              respostas: r.respostas,
              respostas_qual: r.respostas_qualificadas,
              taxa_resp: r.mensagens_emails_referencias > 0
                ? `${((r.respostas / r.mensagens_emails_referencias) * 100).toFixed(0)}%`
                : '-',
              agendamentos: r.agendamentos,
            }))}
            columns={[
              { key: 'dia', label: 'Data', sortable: true },
              { key: 'comercial', label: 'Comercial', sortable: true },
              { key: 'offer', label: 'Offer', sortable: true },
              { key: 'mensagens', label: 'Mensagens', format: 'number', sortable: true },
              { key: 'respostas', label: 'Respostas', format: 'number', sortable: true },
              { key: 'respostas_qual', label: 'Qualificadas', format: 'number', sortable: true },
              { key: 'taxa_resp', label: 'Taxa Resp.', sortable: false },
              { key: 'agendamentos', label: 'Agendamentos', format: 'number', sortable: true },
            ]}
            exportFilename="email-marketing-detalhado"
            pageSize={20}
          />
        </div>
      )}

      {/* Referências */}
      {referenciasData.length > 0 && (
        <div className="card border-pink-500/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-pink-400" />
            Referências ({referenciasData.length} registos)
          </h3>
          <DataTable
            data={referenciasData.map(r => ({
              dia: r.dia,
              comercial: r.comercial,
              mensagens: r.mensagens_emails_referencias,
              respostas: r.respostas,
              respostas_qual: r.respostas_qualificadas,
              taxa_resp: r.mensagens_emails_referencias > 0
                ? `${((r.respostas / r.mensagens_emails_referencias) * 100).toFixed(0)}%`
                : '-',
            }))}
            columns={[
              { key: 'dia', label: 'Data', sortable: true },
              { key: 'comercial', label: 'Comercial', sortable: true },
              { key: 'mensagens', label: 'Mensagens', format: 'number', sortable: true },
              { key: 'respostas', label: 'Respostas', format: 'number', sortable: true },
              { key: 'respostas_qual', label: 'Qualificadas', format: 'number', sortable: true },
              { key: 'taxa_resp', label: 'Taxa', sortable: false },
            ]}
            exportFilename="referencias-detalhado"
            pageSize={20}
          />
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
