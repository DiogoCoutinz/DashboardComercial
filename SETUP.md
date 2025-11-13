# 🚀 Setup Completo — BoomLab Dashboard

## 1️⃣ Pré-requisitos

- Node.js 18+ instalado
- Conta Supabase criada
- Git (opcional)

---

## 2️⃣ Instalar Dependências

```bash
npm install
```

---

## 3️⃣ Configurar Supabase

### 3.1 Criar Projeto no Supabase

1. Vai a [supabase.com](https://supabase.com)
2. Cria um novo projeto
3. Guarda o URL e a Anon Key

### 3.2 Criar ficheiro `.env.local`

Na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Criar Tabela

No **SQL Editor** do Supabase, executa:

```sql
CREATE TABLE comercial_registos_eod (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ano integer NOT NULL,
  trimestre text NOT NULL,
  mes text NOT NULL,
  semana text NOT NULL,
  dia date NOT NULL,
  comercial text NOT NULL,
  canal_aquisicao text NOT NULL,
  offer text NULL,
  
  -- Cold Calling
  chamadas_efetuadas integer NULL DEFAULT 0,
  chamadas_atendidas integer NULL DEFAULT 0,
  decisores_abordados integer NULL DEFAULT 0,
  decisores_qualificados integer NULL DEFAULT 0,
  
  -- LinkedIn / Email / References
  mensagens_emails_referencias integer NULL DEFAULT 0,
  respostas integer NULL DEFAULT 0,
  respostas_qualificadas integer NULL DEFAULT 0,
  
  -- Ads Leads
  submissoes integer NULL DEFAULT 0,
  leads_atenderam integer NULL DEFAULT 0,
  tempo_medio_resposta numeric(10, 2) NULL,
  
  -- Meetings & Conversion
  agendamentos integer NULL DEFAULT 0,
  leads_agendadas integer NULL DEFAULT 0,
  leads_compareceram integer NULL DEFAULT 0,
  dias_marcacao_discovery integer NULL DEFAULT 0,
  
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  
  CONSTRAINT comercial_registos_eod_pkey PRIMARY KEY (id),
  CONSTRAINT comercial_registos_eod_unique UNIQUE (dia, comercial, canal_aquisicao, offer)
) TABLESPACE pg_default;

-- Índices para performance
CREATE INDEX idx_comercial_eod_dia 
  ON comercial_registos_eod USING btree (dia DESC);

CREATE INDEX idx_comercial_eod_comercial 
  ON comercial_registos_eod USING btree (comercial);

CREATE INDEX idx_comercial_eod_mes 
  ON comercial_registos_eod USING btree (ano, mes);

CREATE INDEX idx_comercial_eod_offer 
  ON comercial_registos_eod USING btree (offer) 
  WHERE (offer IS NOT NULL);
```

### 3.4 Configurar RLS (Row Level Security)

```sql
-- Permitir leitura pública
ALTER TABLE comercial_registos_eod ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública"
  ON comercial_registos_eod
  FOR SELECT
  TO public
  USING (true);

-- Escrita apenas via service role (n8n)
CREATE POLICY "Apenas service role pode inserir"
  ON comercial_registos_eod
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

---

## 4️⃣ Executar em Desenvolvimento

```bash
npm run dev
```

Dashboard abre em: **http://localhost:5173**

---

## 5️⃣ Popular com Dados de Teste (Opcional)

Se quiseres testar sem n8n, podes inserir dados manualmente:

```sql
INSERT INTO comercial_registos_eod 
(ano, trimestre, mes, semana, dia, comercial, canal_aquisicao, offer,
 chamadas_efetuadas, chamadas_atendidas, decisores_abordados,
 agendamentos, leads_agendadas, leads_compareceram)
VALUES
(2025, 'Q4', 'novembro', 'nº 46', '2025-11-11', 
 'Daniela Gonçalves', 'Anúncios', 'Consultoria Comercial',
 10, 8, 5, 3, 3, 2),
 
(2025, 'Q4', 'novembro', 'nº 46', '2025-11-12', 
 'Marcelo Lachev', 'Cold Calling', 'Mentoria',
 25, 15, 10, 4, 4, 3);
```

---

## 6️⃣ Configurar n8n (Automação)

### 6.1 Workflow n8n

O n8n deve:
1. Ler Google Sheets diariamente
2. Transformar dados
3. Inserir no Supabase via REST API ou Supabase node

### 6.2 Credenciais Supabase no n8n

- **URL**: https://xxxxx.supabase.co
- **Service Role Key**: (chave com permissões de escrita)

⚠️ **Nunca uses a Service Role Key no frontend!**

---

## 7️⃣ Deploy para Produção

### Opção A: Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Na dashboard Vercel:
# Settings → Environment Variables
# Adiciona VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

### Opção B: Build Manual

```bash
npm run build

# Ficheiros em /dist
# Serve com qualquer static host (Netlify, Cloudflare Pages, etc)
```

---

## 8️⃣ Verificar Setup

### ✅ Checklist

- [ ] Node_modules instalados
- [ ] `.env.local` criado com credenciais corretas
- [ ] Tabela `comercial_registos_eod` criada no Supabase
- [ ] RLS configurado
- [ ] Dados de teste inseridos (opcional)
- [ ] `npm run dev` funciona
- [ ] Dashboard abre no browser
- [ ] Filtros funcionam
- [ ] Gráficos renderizam

---

## 🐛 Troubleshooting

### Erro: "supabase is null"
- Verifica se `.env.local` está correto
- Confirma que o ficheiro está na **raiz** do projeto
- Restart o servidor: `npm run dev`

### Erro: "Failed to fetch"
- Verifica credenciais Supabase
- Confirma que a tabela existe
- Verifica RLS policies (leitura pública habilitada)

### Gráficos não aparecem
- Confirma que há dados na tabela
- Verifica console do browser (F12) para erros
- Testa queries no Supabase SQL Editor

### Filtros não funcionam
- Confirma que há dados variados (diferentes comerciais, canais, etc)
- Verifica se `getFilterOptions()` está a retornar dados

---

## 📚 Próximos Passos

1. Configura n8n para inserir dados reais
2. Ajusta as cores/design se necessário
3. Deploy para produção
4. Partilha o link com a equipa!

---

## 💡 Dicas

- **Performance**: Os índices estão otimizados para queries por data e comercial
- **Manutenção**: n8n insere automaticamente, sem necessidade de updates manuais
- **Escalabilidade**: Supabase aguenta milhões de registos
- **Custos**: Plano gratuito Supabase é suficiente para começar

---

🎉 **Setup completo!** Bom trabalho!
