
-- Configurações table for protocol settings per user
CREATE TABLE public.configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  -- Agente Secretária
  secretaria_tom text NOT NULL DEFAULT 'Profissional e acolhedor',
  secretaria_template_boas_vindas text NOT NULL DEFAULT 'Olá! Sou a assistente virtual do Dr. [Nome]. Como posso ajudá-lo(a) com seu benefício previdenciário?',
  secretaria_resposta_auto boolean NOT NULL DEFAULT true,
  secretaria_horario_comercial boolean NOT NULL DEFAULT false,
  -- Agente Recuperação
  recuperacao_timing_dias integer[] NOT NULL DEFAULT '{2,5,10}',
  recuperacao_template_d2 text NOT NULL DEFAULT 'Olá [Nome]! Vi que conversamos sobre [demanda] há alguns dias. Ainda posso ajudá-lo(a) com essa questão?',
  recuperacao_max_tentativas integer NOT NULL DEFAULT 3,
  recuperacao_opt_out_auto boolean NOT NULL DEFAULT true,
  -- LGPD
  lgpd_anonimizacao boolean NOT NULL DEFAULT true,
  lgpd_consentimento boolean NOT NULL DEFAULT true,
  lgpd_auditoria boolean NOT NULL DEFAULT true,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own config" ON public.configuracoes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own config" ON public.configuracoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own config" ON public.configuracoes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
