import { supabase, type ComercialRegistoEOD, type Filters } from './supabase'

// Helper to apply filters to query
function applyFilters(query: any, filters: Filters) {
  if (filters.startDate) {
    query = query.gte('dia', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('dia', filters.endDate)
  }
  if (filters.comerciais?.length) {
    query = query.in('comercial', filters.comerciais)
  }
  if (filters.canais?.length) {
    query = query.in('canal_aquisicao', filters.canais)
  }
  if (filters.offers?.length) {
    query = query.in('offer', filters.offers)
  }
  if (filters.ano) {
    query = query.eq('ano', filters.ano)
  }
  if (filters.trimestre) {
    query = query.eq('trimestre', filters.trimestre)
  }
  if (filters.mes) {
    query = query.eq('mes', filters.mes)
  }
  return query
}

// Get all registos with filters
export async function getRegistos(filters: Filters = {}): Promise<ComercialRegistoEOD[]> {
  if (!supabase) return []
  
  let query = supabase
    .from('comercial_registos_eod')
    .select('*')
    .order('dia', { ascending: false })
  
  query = applyFilters(query, filters)
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching registos:', error)
    return []
  }
  
  return data || []
}

// Get global KPIs (aggregated)
export async function getGlobalKPIs(filters: Filters = {}) {
  const registos = await getRegistos(filters)
  
  const totals = registos.reduce((acc, r) => ({
    chamadas_efetuadas: acc.chamadas_efetuadas + r.chamadas_efetuadas,
    chamadas_atendidas: acc.chamadas_atendidas + r.chamadas_atendidas,
    decisores_abordados: acc.decisores_abordados + r.decisores_abordados,
    decisores_qualificados: acc.decisores_qualificados + r.decisores_qualificados,
    mensagens_emails_referencias: acc.mensagens_emails_referencias + r.mensagens_emails_referencias,
    respostas: acc.respostas + r.respostas,
    respostas_qualificadas: acc.respostas_qualificadas + r.respostas_qualificadas,
    submissoes: acc.submissoes + r.submissoes,
    leads_atenderam: acc.leads_atenderam + r.leads_atenderam,
    agendamentos: acc.agendamentos + r.agendamentos,
    leads_agendadas: acc.leads_agendadas + r.leads_agendadas,
    leads_compareceram: acc.leads_compareceram + r.leads_compareceram,
  }), {
    chamadas_efetuadas: 0,
    chamadas_atendidas: 0,
    decisores_abordados: 0,
    decisores_qualificados: 0,
    mensagens_emails_referencias: 0,
    respostas: 0,
    respostas_qualificadas: 0,
    submissoes: 0,
    leads_atenderam: 0,
    agendamentos: 0,
    leads_agendadas: 0,
    leads_compareceram: 0,
  })
  
  // Calculate rates
  const taxaAtendimento = totals.chamadas_efetuadas > 0 
    ? (totals.chamadas_atendidas / totals.chamadas_efetuadas) * 100 
    : 0
    
  // 🔥 FIX: Taxa show-up deve usar agendamentos, não leads_agendadas
  const taxaShowUp = totals.agendamentos > 0 
    ? (totals.leads_compareceram / totals.agendamentos) * 100 
    : 0
    
  const taxaConversao = totals.submissoes > 0 
    ? (totals.agendamentos / totals.submissoes) * 100 
    : 0
  
  // Average response time (only for records with value)
  const registosComTempo = registos.filter(r => r.tempo_medio_resposta != null)
  const tempoMedioResposta = registosComTempo.length > 0
    ? registosComTempo.reduce((sum, r) => sum + (r.tempo_medio_resposta || 0), 0) / registosComTempo.length
    : 0
  
  // Average discovery cycle
  const registosComDias = registos.filter(r => r.dias_marcacao_discovery > 0)
  const diasMediosDiscovery = registosComDias.length > 0
    ? registosComDias.reduce((sum, r) => sum + r.dias_marcacao_discovery, 0) / registosComDias.length
    : 0
  
  return {
    ...totals,
    taxaAtendimento,
    taxaShowUp,
    taxaConversao,
    tempoMedioResposta,
    diasMediosDiscovery,
  }
}

// Get data grouped by day
export async function getDataByDay(filters: Filters = {}) {
  const registos = await getRegistos(filters)
  
  const byDay = registos.reduce((acc, r) => {
    if (!acc[r.dia]) {
      acc[r.dia] = {
        dia: r.dia,
        chamadas_efetuadas: 0,
        agendamentos: 0,
        leads_compareceram: 0,
        submissoes: 0,
      }
    }
    acc[r.dia].chamadas_efetuadas += r.chamadas_efetuadas
    acc[r.dia].agendamentos += r.agendamentos
    acc[r.dia].leads_compareceram += r.leads_compareceram
    acc[r.dia].submissoes += r.submissoes
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byDay).sort((a, b) => a.dia.localeCompare(b.dia))
}

// Get data grouped by comercial
export async function getDataByComercial(filters: Filters = {}) {
  const registos = await getRegistos(filters)
  
  const byComercial = registos.reduce((acc, r) => {
    if (!acc[r.comercial]) {
      acc[r.comercial] = {
        comercial: r.comercial,
        chamadas_efetuadas: 0,
        chamadas_atendidas: 0,
        agendamentos: 0,
        leads_compareceram: 0,
        submissoes: 0,
        leads_agendadas: 0,
      }
    }
    acc[r.comercial].chamadas_efetuadas += r.chamadas_efetuadas
    acc[r.comercial].chamadas_atendidas += r.chamadas_atendidas
    acc[r.comercial].agendamentos += r.agendamentos
    acc[r.comercial].leads_compareceram += r.leads_compareceram
    acc[r.comercial].submissoes += r.submissoes
    acc[r.comercial].leads_agendadas += r.leads_agendadas
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byComercial).sort((a, b) => b.agendamentos - a.agendamentos)
}

// Get data grouped by channel
export async function getDataByCanal(filters: Filters = {}) {
  const registos = await getRegistos(filters)
  
  const byCanal = registos.reduce((acc, r) => {
    if (!acc[r.canal_aquisicao]) {
      acc[r.canal_aquisicao] = {
        canal: r.canal_aquisicao,
        chamadas_efetuadas: 0,
        mensagens_emails_referencias: 0,
        respostas: 0,
        submissoes: 0,
        agendamentos: 0,
        leads_compareceram: 0,
      }
    }
    acc[r.canal_aquisicao].chamadas_efetuadas += r.chamadas_efetuadas
    acc[r.canal_aquisicao].mensagens_emails_referencias += r.mensagens_emails_referencias
    acc[r.canal_aquisicao].respostas += r.respostas
    acc[r.canal_aquisicao].submissoes += r.submissoes
    acc[r.canal_aquisicao].agendamentos += r.agendamentos
    acc[r.canal_aquisicao].leads_compareceram += r.leads_compareceram
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byCanal).sort((a, b) => b.agendamentos - a.agendamentos)
}

// Get funnel data
export async function getFunnelData(filters: Filters = {}) {
  const kpis = await getGlobalKPIs(filters)
  
  return {
    contatos: kpis.chamadas_efetuadas + kpis.mensagens_emails_referencias,
    respostas: kpis.chamadas_atendidas + kpis.respostas,
    submissoes: kpis.submissoes,
    agendamentos: kpis.agendamentos,
    showups: kpis.leads_compareceram,
  }
}

// Get filter options (for dropdowns)
export async function getFilterOptions() {
  if (!supabase) {
    return {
      comerciais: [],
      canais: [],
      offers: [],
      anos: [],
      trimestres: [],
      meses: [],
    }
  }
  
  const { data } = await supabase
    .from('comercial_registos_eod')
    .select('comercial, canal_aquisicao, offer, ano, trimestre, mes')
  
  if (!data) {
    return {
      comerciais: [],
      canais: [],
      offers: [],
      anos: [],
      trimestres: [],
      meses: [],
    }
  }
  
  const comerciais = [...new Set(data.map(r => r.comercial))].filter(Boolean).sort()
  const canais = [...new Set(data.map(r => r.canal_aquisicao))].filter(Boolean).sort()
  const offers = [...new Set(data.map(r => r.offer).filter(Boolean))].sort()
  const anos = [...new Set(data.map(r => r.ano))].filter(Boolean).sort((a, b) => b - a)
  const trimestres = [...new Set(data.map(r => r.trimestre))].filter(Boolean).sort()
  const meses = [...new Set(data.map(r => r.mes))].filter(Boolean)
  
  return {
    comerciais,
    canais,
    offers,
    anos,
    trimestres,
    meses,
  }
}
