import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getDataByComercial } from '@/lib/queries'
import { type Filters as FilterType } from '@/lib/supabase'
import Filters from '@/components/Filters'
import QuickPeriodSelector from '@/components/QuickPeriodSelector'
import LoadingState from '@/components/LoadingState'
import DataTable from '@/components/DataTable'
import SimpleBarChart from '@/components/SimpleBarChart'
import { UserCircle } from 'lucide-react'
import { COLORS } from '@/lib/constants'

export default function Comerciais() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [comercialData, setComercialData] = useState<any[]>([])

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
    getDataByComercial(filters).then((data) => {
      // Calculate additional metrics
      const enriched = data.map(c => ({
        ...c,
        taxaAtendimento: c.chamadas_efetuadas > 0 
          ? ((c.chamadas_atendidas / c.chamadas_efetuadas) * 100).toFixed(1) + '%'
          : '-',
        taxaShowUp: c.leads_agendadas > 0 
          ? ((c.leads_compareceram / c.leads_agendadas) * 100).toFixed(1) + '%'
          : '-',
        taxaConversao: c.submissoes > 0 
          ? ((c.agendamentos / c.submissoes) * 100).toFixed(1) + '%'
          : '-',
      }))
      setComercialData(enriched)
      setLoading(false)
    })
  }, [searchParams])

  if (loading) {
    return <LoadingState message="A carregar dados dos comerciais..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="w-8 h-8" />
            Análise por Comercial
          </h2>
          <p className="text-sm text-gray-400 mt-1">Performance individual da equipa</p>
        </div>
      </div>

      <QuickPeriodSelector />
      <Filters />

      {/* Leaderboard Chart */}
      {comercialData.length > 0 && (
        <SimpleBarChart
          data={comercialData.map(c => ({
            name: c.comercial,
            agendamentos: c.agendamentos,
            showups: c.leads_compareceram,
            chamadas: c.chamadas_efetuadas,
          }))}
          title="🏆 Leaderboard da Equipa"
          dataKeys={[
            { key: 'agendamentos', label: 'Agendamentos', color: COLORS.success },
            { key: 'showups', label: 'Show-ups', color: COLORS.warning },
          ]}
        />
      )}

      {/* Detailed Table */}
      {comercialData.length > 0 && (
        <DataTable
          data={comercialData}
          columns={[
            { key: 'comercial', label: 'Comercial', sortable: true },
            { key: 'chamadas_efetuadas', label: 'Chamadas', format: 'number', sortable: true },
            { key: 'chamadas_atendidas', label: 'Atendidas', format: 'number', sortable: true },
            { key: 'taxaAtendimento', label: 'Taxa Atend.', sortable: false },
            { key: 'submissoes', label: 'Submissões', format: 'number', sortable: true },
            { key: 'agendamentos', label: 'Agendamentos', format: 'number', sortable: true },
            { key: 'taxaConversao', label: 'Conv.', sortable: false },
            { key: 'leads_agendadas', label: 'Leads Agend.', format: 'number', sortable: true },
            { key: 'leads_compareceram', label: 'Show-ups', format: 'number', sortable: true },
            { key: 'taxaShowUp', label: 'Taxa Show-Up', sortable: false },
          ]}
          title="📊 Performance Detalhada"
          exportFilename="comerciais-performance"
          pageSize={10}
        />
      )}

      {comercialData.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          Sem dados disponíveis para os filtros selecionados
        </div>
      )}
    </div>
  )
}
