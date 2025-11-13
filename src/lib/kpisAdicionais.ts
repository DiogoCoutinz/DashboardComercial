import { type Filters } from './supabase'
import { getGlobalKPIs } from './queries'

// Additional KPI calculations beyond the main queries

export async function getAdvancedMetrics(filters: Filters) {
  const kpis = await getGlobalKPIs(filters)
  
  return {
    // Efficiency metrics
    eficienciaGeral: kpis.chamadas_efetuadas > 0 
      ? (kpis.agendamentos / kpis.chamadas_efetuadas) * 100 
      : 0,
    
    // Quality metrics
    qualidadeLeads: kpis.leads_atenderam > 0
      ? (kpis.leads_compareceram / kpis.leads_atenderam) * 100
      : 0,
    
    // Conversion funnel efficiency
    funnelEfficiency: kpis.submissoes > 0
      ? (kpis.leads_compareceram / kpis.submissoes) * 100
      : 0,
  }
}

export function calculateROI(leads: number, conversions: number, avgDealValue: number, cost: number) {
  const revenue = conversions * avgDealValue
  const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0
  return {
    revenue,
    cost,
    roi,
    costPerLead: leads > 0 ? cost / leads : 0,
    costPerConversion: conversions > 0 ? cost / conversions : 0,
  }
}
