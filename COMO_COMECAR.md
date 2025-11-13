# 🚀 Como Começar

O dashboard está limpo e pronto para seres customizado!

## ✅ O que está incluído

### Componentes de UI prontos:
- `KpiCard` - Cards de KPIs com comparação
- `MonthTrend` - Gráfico de linha temporal
- `BarCompare` - Gráfico de barras comparativo
- `HeatmapTable` - Tabela heatmap interativa
- `DataTable` - Tabela com sort, search e paginação
- `Filters` - Sistema de filtros
- `EmptyState` / `LoadingState` - Estados vazios e loading

### Páginas configuradas:
- Dashboard (página principal)
- 3 páginas secundárias (Vendedores, Clientes, Famílias)
- Página de detalhe genérica

### Utilitários:
- Formatação de moeda, números, percentagens
- Exportação para CSV
- Partilha de links com filtros
- Constantes de cores e meses

## 📝 Próximos Passos

### 1. Definir os teus tipos de dados

Edita `src/lib/supabase.ts`:

```typescript
export type MeuDado = {
  id: string
  nome: string
  valor: number
  // ... teus campos
}

export type Filters = {
  categoria?: string[]
  periodo?: string
  // ... teus filtros
}
```

### 2. Criar queries

Edita `src/lib/queries.ts`:

```typescript
export async function getDados(filters: Filters) {
  if (!supabase) return []
  
  let query = supabase
    .from('tua_tabela')
    .select('*')
  
  // Aplicar filtros
  if (filters.categoria?.length) {
    query = query.in('categoria', filters.categoria)
  }
  
  const { data } = await query
  return data || []
}
```

### 3. Atualizar o Dashboard

Edita `src/pages/Dashboard.tsx` para buscar e exibir os teus dados

### 4. Customizar navegação

Se precisares de outros nomes nas páginas, edita `src/components/Layout.tsx`

## 🎨 Usar os Componentes

```tsx
// KPI Card
<KpiCard 
  label="Total"
  value={10000}
  previous={8000}
  format="currency"
/>

// Gráfico de linha
<MonthTrend 
  data={[{ mes: '2024-01', valor: 1000 }]}
  title="Evolução"
/>

// Tabela
<DataTable 
  data={myData}
  columns={[
    { key: 'nome', label: 'Nome' },
    { key: 'valor', label: 'Valor', format: 'currency' }
  ]}
  exportFilename="export"
/>
```

## 🎯 Design já configurado

- Dark theme
- Responsivo mobile-first
- Cores customizáveis em `src/lib/constants.ts`
- Tailwind CSS configurado

Está tudo pronto para começares! 🎉

