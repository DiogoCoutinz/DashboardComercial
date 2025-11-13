import { supabase, type ComercialRegistoMF, type FiltersMF } from './supabase'

// Helper to apply filters to MF query
function applyFiltersMF(query: any, filters: FiltersMF) {
  if (filters.startDate) {
    query = query.gte('dia', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('dia', filters.endDate)
  }
  if (filters.executives?.length) {
    query = query.in('executive', filters.executives)
  }
  if (filters.offers?.length) {
    query = query.in('offer', filters.offers)
  }
  if (filters.mercados?.length) {
    query = query.in('mercado', filters.mercados)
  }
  if (filters.closers?.length) {
    query = query.in('closer', filters.closers)
  }
  if (filters.comerciais?.length) {
    query = query.in('comercial_consultor', filters.comerciais)
  }
  if (filters.canais?.length) {
    query = query.in('canal_aquisicao', filters.canais)
  }
  if (filters.tipoRegisto) {
    query = query.eq('tipo_registo', filters.tipoRegisto)
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

// Get all MF registos
export async function getRegistosMF(filters: FiltersMF = {}): Promise<ComercialRegistoMF[]> {
  if (!supabase) return []
  
  let query = supabase
    .from('comercial_registos_mf')
    .select('*')
    .order('dia', { ascending: false })
  
  query = applyFiltersMF(query, filters)
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching MF registos:', error)
    return []
  }
  
  return data || []
}

// Get global MF KPIs (only projetos, exclude custos)
export async function getGlobalKPIsMF(filters: FiltersMF = {}) {
  const registos = await getRegistosMF({ ...filters, tipoRegisto: 'projeto' })
  
  const totalProjetos = registos.length
  const totalReceita = registos.reduce((acc, r) => acc + (r.ticket || 0), 0)
  const ticketMedio = totalProjetos > 0 ? totalReceita / totalProjetos : 0
  
  // Breakdown by offer
  const byOffer = registos.reduce((acc, r) => {
    const offer = r.offer || 'Sem Offer'
    if (!acc[offer]) {
      acc[offer] = { count: 0, receita: 0 }
    }
    acc[offer].count++
    acc[offer].receita += r.ticket || 0
    return acc
  }, {} as Record<string, { count: number; receita: number }>)
  
  // Breakdown by payment mode
  const byPaymentMode = registos.reduce((acc, r) => {
    const mode = r.modo_pagamento || 'Não definido'
    if (!acc[mode]) {
      acc[mode] = { count: 0, receita: 0 }
    }
    acc[mode].count++
    acc[mode].receita += r.ticket || 0
    return acc
  }, {} as Record<string, { count: number; receita: number }>)
  
  // Breakdown by acquisition channel
  const byChannel = registos.reduce((acc, r) => {
    if (!r.canal_aquisicao) return acc
    if (!acc[r.canal_aquisicao]) {
      acc[r.canal_aquisicao] = { count: 0, receita: 0 }
    }
    acc[r.canal_aquisicao].count++
    acc[r.canal_aquisicao].receita += r.ticket || 0
    return acc
  }, {} as Record<string, { count: number; receita: number }>)
  
  return {
    totalProjetos,
    totalReceita,
    ticketMedio,
    byOffer,
    byPaymentMode,
    byChannel,
  }
}

// Get data grouped by closer
export async function getDataByCloserMF(filters: FiltersMF = {}) {
  const registos = await getRegistosMF({ ...filters, tipoRegisto: 'projeto' })
  
  const byCloser = registos.reduce((acc, r) => {
    if (!r.closer) return acc
    
    if (!acc[r.closer]) {
      acc[r.closer] = {
        closer: r.closer,
        projetos: 0,
        receita: 0,
      }
    }
    acc[r.closer].projetos++
    acc[r.closer].receita += r.ticket || 0
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byCloser).sort((a, b) => b.receita - a.receita)
}

// Get data grouped by comercial consultor
export async function getDataByComercialMF(filters: FiltersMF = {}) {
  const registos = await getRegistosMF({ ...filters, tipoRegisto: 'projeto' })
  
  const byComercial = registos.reduce((acc, r) => {
    if (!r.comercial_consultor) return acc
    
    if (!acc[r.comercial_consultor]) {
      acc[r.comercial_consultor] = {
        comercial: r.comercial_consultor,
        projetos: 0,
        receita: 0,
      }
    }
    acc[r.comercial_consultor].projetos++
    acc[r.comercial_consultor].receita += r.ticket || 0
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byComercial).sort((a, b) => b.receita - a.receita)
}

// Get monthly trend data
export async function getMonthlyTrendMF(filters: FiltersMF = {}) {
  const registos = await getRegistosMF({ ...filters, tipoRegisto: 'projeto' })
  
  const byMonth = registos.reduce((acc, r) => {
    const key = `${r.ano}-${r.mes}`
    if (!acc[key]) {
      acc[key] = {
        mes: r.mes,
        ano: r.ano,
        projetos: 0,
        receita: 0,
      }
    }
    acc[key].projetos++
    acc[key].receita += r.ticket || 0
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byMonth).sort((a: any, b: any) => {
    if (a.ano !== b.ano) return a.ano - b.ano
    const monthOrder = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    return monthOrder.indexOf(a.mes) - monthOrder.indexOf(b.mes)
  })
}

// Get data by market (mercado)
export async function getDataByMarketMF(filters: FiltersMF = {}) {
  const registos = await getRegistosMF({ ...filters, tipoRegisto: 'projeto' })
  
  const byMarket = registos.reduce((acc, r) => {
    const market = r.mercado || 'Não especificado'
    if (!acc[market]) {
      acc[market] = {
        mercado: market,
        projetos: 0,
        receita: 0,
      }
    }
    acc[market].projetos++
    acc[market].receita += r.ticket || 0
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(byMarket).sort((a, b) => b.receita - a.receita)
}

// Get filter options for MF
export async function getFilterOptionsMF() {
  if (!supabase) {
    return {
      executives: [],
      offers: [],
      mercados: [],
      closers: [],
      comerciais: [],
      canais: [],
      anos: [],
      trimestres: [],
      meses: [],
    }
  }
  
  const { data } = await supabase
    .from('comercial_registos_mf')
    .select('executive, offer, mercado, closer, comercial_consultor, canal_aquisicao, ano, trimestre, mes')
  
  if (!data) {
    return {
      executives: [],
      offers: [],
      mercados: [],
      closers: [],
      comerciais: [],
      canais: [],
      anos: [],
      trimestres: [],
      meses: [],
    }
  }
  
  const executives = [...new Set(data.map(r => r.executive))].filter(Boolean).sort()
  const offers = [...new Set(data.map(r => r.offer).filter(Boolean))].sort()
  const mercados = [...new Set(data.map(r => r.mercado).filter(Boolean))].sort()
  const closers = [...new Set(data.map(r => r.closer).filter(Boolean))].sort()
  const comerciais = [...new Set(data.map(r => r.comercial_consultor).filter(Boolean))].sort()
  const canais = [...new Set(data.map(r => r.canal_aquisicao).filter(Boolean))].sort()
  const anos = [...new Set(data.map(r => r.ano))].filter(Boolean).sort((a, b) => b - a)
  const trimestres = [...new Set(data.map(r => r.trimestre))].filter(Boolean).sort()
  const meses = [...new Set(data.map(r => r.mes))].filter(Boolean)
  
  return {
    executives,
    offers,
    mercados,
    closers,
    comerciais,
    canais,
    anos,
    trimestres,
    meses,
  }
}

