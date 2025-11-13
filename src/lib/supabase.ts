import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Tabela principal: comercial_registos_eod
export type ComercialRegistoEOD = {
  id: string
  ano: number
  trimestre: string
  mes: string
  semana: string
  dia: string // date as string
  comercial: string
  canal_aquisicao: string
  offer: string | null
  
  // Cold Calling KPIs
  chamadas_efetuadas: number
  chamadas_atendidas: number
  decisores_abordados: number
  decisores_qualificados: number
  
  // LinkedIn / Email / Reference KPIs
  mensagens_emails_referencias: number
  respostas: number
  respostas_qualificadas: number
  
  // Ads Leads KPIs
  submissoes: number
  leads_atenderam: number
  tempo_medio_resposta: number | null
  
  // Meetings & Conversion
  agendamentos: number
  leads_agendadas: number
  leads_compareceram: number
  dias_marcacao_discovery: number
  
  created_at: string
  updated_at: string
}

// Tabela PPF: Performance Pós-First Contact (Closer Stage)
export type ComercialRegistoPPF = {
  id: string
  ano: number
  trimestre: string
  mes: string
  semana: string
  dia: string
  closer: string
  offer: string | null
  
  // Discovery Stage
  discoverys: number
  discoverys_no_shows: number
  discoverys_reagendadas: number
  
  // Follow-up Stage
  follow_ups: number
  follow_ups_no_shows: number
  follow_ups_reagendadas: number
  
  // Q&A Stage
  qas: number
  qas_no_shows: number
  qas_reagendadas: number
  
  // Lead Qualification
  mqls: number // Marketing Qualified Leads
  sqls: number // Sales Qualified Leads
  verbal_agreements: number
  
  // Contact & Engagement
  leads_contactadas: number
  chamadas_atendidas: number
  remarketings: number
  
  // Scheduling & Attendance
  leads_agendadas_discovery: number
  comparecimentos_discovery: number
  leads_agendadas_followup: number
  comparecimentos_followup: number
  leads_agendadas_hoje: number
  leads_compareceram: number
  
  // Follow-up Contact
  leads_contactadas_2: number
  chamadas_atendidas_2: number
  
  // Status Changes
  reagendamentos: number
  cancelamentos: number
  
  // Communication
  mensagens_enviadas: number
  respostas: number
  
  // Cycle Metrics
  dias_discovery_followup: number
  duracao_ciclo_vendas: number
  
  // Origin Tracking
  comercial_origem: string | null
  canal_aquisicao_origem: string | null
  mqls_comercial: number
  sqls_comercial: number
  verbal_agreements_comercial: number
  
  created_at: string
  updated_at: string
}

export type Filters = {
  startDate?: string
  endDate?: string
  comerciais?: string[]
  canais?: string[]
  offers?: string[]
  ano?: number
  trimestre?: string
  mes?: string
}

export type FiltersPPF = {
  startDate?: string
  endDate?: string
  closers?: string[]
  offers?: string[]
  comercialOrigem?: string[]
  canalOrigem?: string[]
  ano?: number
  trimestre?: string
  mes?: string
}

// MF = Martim Francisco (Projetos Fechados)
export type ComercialRegistoMF = {
  id: string
  ano: number
  trimestre: string
  mes: string
  semana: string
  dia: string // date as string
  executive: string
  cliente: string | null
  nome: string | null
  mercado: string | null
  offer: string | null
  ticket: number | null
  modo_pagamento: string | null
  inicio_projeto: string | null // date as string
  duracao_projeto_dias: number | null
  canal_aquisicao: string | null
  comercial_consultor: string | null
  closer: string | null
  tipo_registo: string // 'projeto' or 'custos'
  created_at: string
  updated_at: string
}

export type FiltersMF = {
  startDate?: string
  endDate?: string
  executives?: string[]
  offers?: string[]
  mercados?: string[]
  closers?: string[]
  comerciais?: string[]
  canais?: string[]
  tipoRegisto?: string // 'projeto' or 'custos'
  ano?: number
  trimestre?: string
  mes?: string
}

