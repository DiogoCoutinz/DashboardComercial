# 📊 BoomLab — Dashboard Comercial

Dashboard comercial avançado em tempo real para análise de performance da equipa BoomLab.

Desenvolvido com **React + TypeScript + Supabase + Recharts**

---

## 🚀 Features

### 📞 **EOD** — End of Day (Prospecting)
- **KPIs Globais**: Chamadas, Taxa Atendimento, Agendamentos, Show-up Rate, Submissões
- **Performance por Canal**: Cold Calling, Anúncios, Email Marketing, Referências
- **Funil de Conversão**: 3 funis específicos por canal
- **Leaderboard**: Performance da equipa comercial
- **Filtros Avançados**: Período, Comercial, Canal, Offer

### 🎯 **PPF** — Performance Pós-First (Sales Cycle)
- **Qualificação**: MQLs → SQLs → Verbal Agreements
- **Pipeline de Reuniões**: Discovery, Follow-up, Q&A Sessions
- **Lead Nurture**: Remarketing, No-shows, Reagendamentos
- **Performance por Closer**: António Xia, Ricardo Cardoso, Martim Francisco
- **Rastreio de Origem**: De onde vieram os leads que fecharam

### 💰 **MF** — Martim Francisco (Projetos Fechados)
- **Receita Total**: Ticket médio, Total projetos
- **Breakdown por Offer**: Mentoria, Consultoria, IA
- **Modo de Pagamento**: Upfront vs Prestações
- **Performance**: Por Closer, por Comercial, por Canal
- **Mercados**: Intermediação Crédito, Seguros, etc
- **Lista de Projetos**: Detalhes de cada projeto fechado

### 🔍 Filtros Avançados (todos os dashboards)
- **Período**: Data início/fim, Ano, Trimestre, Mês, Quick Selectors
- **Pessoas**: Comerciais, Closers, Executives
- **Segmentação**: Canal, Offer, Mercado
- Filtros persistem na URL (shareable)

---

## 🗄️ Database Schema

### Tabela: `comercial_registos_eod`

Cada registo = 1 comercial × 1 dia × 1 canal × 1 offer

**Campos principais:**
```sql
- ano, trimestre, mes, semana, dia
- comercial (nome do comercial)
- canal_aquisicao (Cold Calling, Anúncios, etc)
- offer (Mentoria, Consultoria, etc)

-- Cold Calling KPIs
- chamadas_efetuadas, chamadas_atendidas
- decisores_abordados, decisores_qualificados

-- LinkedIn / Email KPIs
- mensagens_emails_referencias
- respostas, respostas_qualificadas

-- Ads / Leads KPIs
- submissoes, leads_atenderam
- tempo_medio_resposta

-- Conversion KPIs
- agendamentos, leads_agendadas
- leads_compareceram
- dias_marcacao_discovery
```

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS (dark theme)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Router**: React Router DOM v6
- **Deploy**: Vercel

---

## 📦 Setup Rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

Criar `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Criar tabela no Supabase

```sql
CREATE TABLE comercial_registos_eod (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ano integer NOT NULL,
  trimestre text NOT NULL,
  mes text NOT NULL,
  semana text NOT NULL,
  dia date NOT NULL,
  comercial text NOT NULL,
  canal_aquisicao text NOT NULL,
  offer text,
  
  chamadas_efetuadas integer DEFAULT 0,
  chamadas_atendidas integer DEFAULT 0,
  decisores_abordados integer DEFAULT 0,
  decisores_qualificados integer DEFAULT 0,
  
  mensagens_emails_referencias integer DEFAULT 0,
  respostas integer DEFAULT 0,
  respostas_qualificadas integer DEFAULT 0,
  
  submissoes integer DEFAULT 0,
  leads_atenderam integer DEFAULT 0,
  tempo_medio_resposta numeric(10, 2),
  
  agendamentos integer DEFAULT 0,
  leads_agendadas integer DEFAULT 0,
  leads_compareceram integer DEFAULT 0,
  dias_marcacao_discovery integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(dia, comercial, canal_aquisicao, offer)
);

-- Índices para performance
CREATE INDEX idx_comercial_eod_dia ON comercial_registos_eod(dia DESC);
CREATE INDEX idx_comercial_eod_comercial ON comercial_registos_eod(comercial);
CREATE INDEX idx_comercial_eod_mes ON comercial_registos_eod(ano, mes);
CREATE INDEX idx_comercial_eod_offer ON comercial_registos_eod(offer) WHERE offer IS NOT NULL;
```

### 4. Executar

```bash
npm run dev
```

Abre em **http://localhost:5173** 🚀

---

## 📁 Estrutura do Projeto

```
/src
  /components
    - Layout.tsx          → Layout com navegação
    - Filters.tsx         → Filtros avançados
    - KpiCard.tsx         → Card de KPI
    - MonthTrend.tsx      → Gráfico temporal
    - BarCompare.tsx      → Gráfico de barras
    - DataTable.tsx       → Tabela com sort/search/export
    - EmptyState.tsx      → Estado vazio
    - LoadingState.tsx    → Loading
    - ShareButton.tsx     → Partilhar com filtros
    - ExportButton.tsx    → Export CSV
    
  /pages
    - Dashboard.tsx       → Dashboard principal
    - Comerciais.tsx      → Análise por comercial
    - Canais.tsx          → Análise por canal
    - Funil.tsx           → Funil de conversão
    
  /lib
    - supabase.ts         → Client + Types
    - queries.ts          → Queries principais
    - format.ts           → Formatação
    - export.ts           → Export + Share
    - constants.ts        → Cores e constantes
```

---

## 🎨 Design System

### Cores (definidas em `constants.ts`)
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)
- **Warning**: Orange (#f59e0b)
- **Purple**: #8b5cf6
- **Cyan**: #06b6d4

### Dark Theme
- Background: #0a0a0a
- Cards: #1a1a1a
- Borders: #2a2a2a
- Text: #e5e5e5

---

## 🔄 Data Flow

1. **n8n automation** → insere dados no Supabase diariamente
2. **Supabase** → armazena em `comercial_registos_eod`
3. **Dashboard** → lê via Supabase JS Client
4. **Queries** → agregam e calculam KPIs
5. **Components** → renderizam visualizações

---

## 📊 KPIs Calculados

- **Taxa Atendimento**: chamadas_atendidas / chamadas_efetuadas
- **Taxa Show-Up**: leads_compareceram / leads_agendadas
- **Taxa Conversão**: agendamentos / submissoes
- **Tempo Médio Resposta**: média dos registos com tempo
- **Ciclo Discovery**: média dos dias_marcacao_discovery

---

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Configurar env vars no dashboard Vercel:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### Build Local

```bash
npm run build
npm run preview
```

---

## 🔐 Segurança

- Supabase RLS (Row Level Security) configurado
- Anon key é pública (só leitura)
- n8n usa service role key (escrita)

---

## 📈 Futuro

- [ ] Tabela PPF (Performance por Família?)
- [ ] Tabela MF (?)
- [ ] Alertas de performance
- [ ] Metas e objetivos
- [ ] Comparação entre períodos
- [ ] Previsões com ML

---

## 👨‍💻 Desenvolvido por

**BoomLab Tech Team**

Com ❤️ e ☕ em Portugal 🇵🇹

---

## 📝 Licença

Propriedade privada — BoomLab
