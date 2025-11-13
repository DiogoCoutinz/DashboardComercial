import { supabase, type ComercialRegistoPPF, type FiltersPPF } from './supabase'

// Helper to apply filters to PPF query
function applyFiltersPPF(query: any, filters: FiltersPPF) {
  if (filters.startDate) {
    query = query.gte('dia', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('dia', filters.endDate)
  }
  if (filters.closers?.length) {
    query = query.in('closer', filters.closers)
  }
  if (filters.offers?.length) {
    query = query.in('offer', filters.offers)
  }
  if (filters.comercialOrigem?.length) {
    query = query.in('comercial_origem', filters.comercialOrigem)
  }
  if (filters.canalOrigem?.length) {
    query = query.in('canal_aquisicao_origem', filters.canalOrigem)
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

// Get all PPF registos
export async function getRegistosPPF(filters: FiltersPPF = {}): Promise<ComercialRegistoPPF[]> {
  if (!supabase) return []
  
  let query = supabase
    .from('comercial_registos_ppf')
    .select('*')
    .order('dia', { ascending: false })
  
  query = applyFiltersPPF(query, filters)
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching PPF registos:', error)
    return []
  }
  
  return data || []
}

// Get global PPF KPIs
export async function getGlobalKPIsPPF(filters: FiltersPPF = {}) {
  const registos = await getRegistosPPF(filters)
  
  const totals = registos.reduce((acc, r) => ({
    // Discovery Stage
    discoverys: acc.discoverys + r.discoverys,
    discoverys_no_shows: acc.discoverys_no_shows + r.discoverys_no_shows,
    discoverys_reagendadas: acc.discoverys_reagendadas + r.discoverys_reagendadas,
    
    // Follow-up Stage
    follow_ups: acc.follow_ups + r.follow_ups,
    follow_ups_no_shows: acc.follow_ups_no_shows + r.follow_ups_no_shows,
    follow_ups_reagendadas: acc.follow_ups_reagendadas + r.follow_ups_reagendadas,
    
    // Q&A Stage
    qas: acc.qas + r.qas,
    qas_no_shows: acc.qas_no_shows + r.qas_no_shows,
    qas_reagendadas: acc.qas_reagendadas + r.qas_reagendadas,
    
    // Qualification
    mqls: acc.mqls + r.mqls,
    sqls: acc.sqls + r.sqls,
    verbal_agreements: acc.verbal_agreements + r.verbal_agreements,
    
    // Attendance
    leads_compareceram: acc.leads_compareceram + r.leads_compareceram,
    leads_agendadas_hoje: acc.leads_agendadas_hoje + r.leads_agendadas_hoje,
    
    // Origin tracking
    mqls_comercial: acc.mqls_comercial + r.mqls_comercial,
    sqls_comercial: acc.sqls_comercial + r.sqls_comercial,
    verbal_agreements_comercial: acc.verbal_agreements_comercial + r.verbal_agreements_comercial,
  }), {
    discoverys: 0,
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
    leads_compareceram: 0,
    leads_agendadas_hoje: 0,
    mqls_comercial: 0,
    sqls_comercial: 0,
    verbal_agreements_comercial: 0,
  })
  
  // Calculate rates
  const taxaShowUpDiscovery = totals.discoverys > 0 
    ? ((totals.discoverys - totals.discoverys_no_shows) / totals.discoverys) * 100 
    : 0
    
  const taxaShowUpFollowUp = totals.follow_ups > 0 
    ? ((totals.follow_ups - totals.follow_ups_no_shows) / totals.follow_ups) * 100 
    : 0
    
  const taxaShowUpQA = totals.qas > 0 
    ? ((totals.qas - totals.qas_no_shows) / totals.qas) * 100 
    : 0
  
  const taxaConversaoMQLtoSQL = totals.mqls > 0 
    ? (totals.sqls / totals.mqls) * 100 
    : 0
    
  const taxaConversaoSQLtoVerbal = totals.sqls > 0 
    ? (totals.verbal_agreements / totals.sqls) * 100 
    : 0
  
  return {
    ...totals,
    taxaShowUpDiscovery,
    taxaShowUpFollowUp,
    taxaShowUpQA,
    taxaConversaoMQLtoSQL,
    taxaConversaoSQLtoVerbal,
  }
}

// Get data grouped by closer
export async function getDataByCloser(filters: FiltersPPF = {}) {
  const registos = await getRegistosPPF(filters)
  
  const byCloser = registos.reduce((acc, r) => {
    if (!acc[r.closer]) {
      acc[r.closer] = {
        closer: r.closer,
        discoverys: 0,
        follow_ups: 0,
        qas: 0,
        mqls: 0,
        sqls: 0,
        verbal_agreements: 0,
        no_shows_total: 0,
      }
    }
    acc[r.closer].discoverys += r.discoverys
    acc[r.closer].follow_ups += r.follow_ups
    acc[r.closer].qas += r.qas
    acc[r.closer].mqls += r.mqls
    acc[r.closer].sqls += r.sqls
    acc[r.closer].verbal_agreements += r.verbal_agreements
    acc[r.closer].no_shows_total += r.discoverys_no_shows + r.follow_ups_no_shows + r.qas_no_shows
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byCloser).sort((a, b) => b.verbal_agreements - a.verbal_agreements)
}

// Get data grouped by origin (comercial + canal)
export async function getDataByOrigin(filters: FiltersPPF = {}) {
  const registos = await getRegistosPPF(filters)
  
  const byOrigin = registos.reduce((acc, r) => {
    if (!r.comercial_origem || !r.canal_aquisicao_origem) return acc
    
    const key = `${r.comercial_origem} - ${r.canal_aquisicao_origem}`
    if (!acc[key]) {
      acc[key] = {
        comercial: r.comercial_origem,
        canal: r.canal_aquisicao_origem,
        mqls: 0,
        sqls: 0,
        verbal_agreements: 0,
      }
    }
    acc[key].mqls += r.mqls_comercial
    acc[key].sqls += r.sqls_comercial
    acc[key].verbal_agreements += r.verbal_agreements_comercial
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byOrigin).sort((a, b) => b.verbal_agreements - a.verbal_agreements)
}

// Get filter options for PPF
export async function getFilterOptionsPPF() {
  if (!supabase) {
    return {
      closers: [],
      offers: [],
      comerciaisOrigem: [],
      canaisOrigem: [],
      anos: [],
      trimestres: [],
      meses: [],
    }
  }
  
  const { data } = await supabase
    .from('comercial_registos_ppf')
    .select('closer, offer, comercial_origem, canal_aquisicao_origem, ano, trimestre, mes')
  
  if (!data) {
    return {
      closers: [],
      offers: [],
      comerciaisOrigem: [],
      canaisOrigem: [],
      anos: [],
      trimestres: [],
      meses: [],
    }
  }
  
  const closers = [...new Set(data.map(r => r.closer))].filter(Boolean).sort()
  const offers = [...new Set(data.map(r => r.offer).filter(Boolean))].sort()
  const comerciaisOrigem = [...new Set(data.map(r => r.comercial_origem).filter(Boolean))].sort()
  const canaisOrigem = [...new Set(data.map(r => r.canal_aquisicao_origem).filter(Boolean))].sort()
  const anos = [...new Set(data.map(r => r.ano))].filter(Boolean).sort((a, b) => b - a)
  const trimestres = [...new Set(data.map(r => r.trimestre))].filter(Boolean).sort()
  const meses = [...new Set(data.map(r => r.mes))].filter(Boolean)
  
  return {
    closers,
    offers,
    comerciaisOrigem,
    canaisOrigem,
    anos,
    trimestres,
    meses,
  }
}

