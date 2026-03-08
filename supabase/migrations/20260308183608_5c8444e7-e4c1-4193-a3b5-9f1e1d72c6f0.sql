
-- Enum for demand types
CREATE TYPE public.demand_type AS ENUM ('aposentadoria', 'inss', 'bpc_loas', 'revisao', 'outros');

-- Enum for contact status
CREATE TYPE public.contato_status AS ENUM ('novo', 'quente', 'esfriado', 'reativado', 'fechado');

-- Enum for message direction
CREATE TYPE public.msg_direction AS ENUM ('in', 'out');

-- ============================================================
-- ENT-01: Contatos
-- ============================================================
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advogado_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  demand_type public.demand_type,
  status public.contato_status NOT NULL DEFAULT 'novo',
  score_hot REAL NOT NULL DEFAULT 0 CHECK (score_hot >= 0 AND score_hot <= 1),
  last_msg_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_contatos_advogado ON public.contatos(advogado_id);
CREATE INDEX idx_contatos_phone ON public.contatos(phone);
CREATE INDEX idx_contatos_status_last_msg ON public.contatos(status, last_msg_at DESC);

ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advogados can view own contatos"
  ON public.contatos FOR SELECT
  USING (auth.uid() = advogado_id);

CREATE POLICY "Advogados can insert own contatos"
  ON public.contatos FOR INSERT
  WITH CHECK (auth.uid() = advogado_id);

CREATE POLICY "Advogados can update own contatos"
  ON public.contatos FOR UPDATE
  USING (auth.uid() = advogado_id);

CREATE POLICY "Advogados can delete own contatos"
  ON public.contatos FOR DELETE
  USING (auth.uid() = advogado_id);

-- ============================================================
-- ENT-02: Mensagens
-- ============================================================
CREATE TABLE public.mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contato_id UUID NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  direction public.msg_direction NOT NULL,
  ai_class TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_mensagens_contato ON public.mensagens(contato_id);
CREATE INDEX idx_mensagens_created ON public.mensagens(created_at DESC);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Mensagens are accessible if the user owns the parent contato
CREATE POLICY "Advogados can view own mensagens"
  ON public.mensagens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contatos
      WHERE contatos.id = mensagens.contato_id
      AND contatos.advogado_id = auth.uid()
    )
  );

CREATE POLICY "Advogados can insert own mensagens"
  ON public.mensagens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contatos
      WHERE contatos.id = mensagens.contato_id
      AND contatos.advogado_id = auth.uid()
    )
  );

-- ============================================================
-- ENT-04: Relatórios
-- ============================================================
CREATE TABLE public.relatorios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advogado_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics_json JSONB NOT NULL DEFAULT '{}',
  reativacoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_relatorios_advogado_period ON public.relatorios(advogado_id, period_start);

ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advogados can view own relatorios"
  ON public.relatorios FOR SELECT
  USING (auth.uid() = advogado_id);

CREATE POLICY "Advogados can insert own relatorios"
  ON public.relatorios FOR INSERT
  WITH CHECK (auth.uid() = advogado_id);

-- ============================================================
-- ENT-05: Alertas
-- ============================================================
CREATE TABLE public.alertas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advogado_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contato_id UUID NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_alertas_advogado ON public.alertas(advogado_id, read, created_at DESC);

ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advogados can view own alertas"
  ON public.alertas FOR SELECT
  USING (auth.uid() = advogado_id);

CREATE POLICY "Advogados can update own alertas"
  ON public.alertas FOR UPDATE
  USING (auth.uid() = advogado_id);

CREATE POLICY "Advogados can insert own alertas"
  ON public.alertas FOR INSERT
  WITH CHECK (auth.uid() = advogado_id);

-- ============================================================
-- Triggers for updated_at
-- ============================================================
CREATE TRIGGER update_contatos_updated_at
  BEFORE UPDATE ON public.contatos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
