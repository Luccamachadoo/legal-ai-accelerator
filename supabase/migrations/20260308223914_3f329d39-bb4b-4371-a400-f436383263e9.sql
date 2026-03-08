
-- Fix: Convert ALL RESTRICTIVE policies to PERMISSIVE
-- Profiles
DROP POLICY "Users can view their own profile" ON public.profiles;
DROP POLICY "Users can insert their own profile" ON public.profiles;
DROP POLICY "Users can update their own profile" ON public.profiles;
DROP POLICY "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Contatos
DROP POLICY "Advogados can view own contatos" ON public.contatos;
DROP POLICY "Advogados can insert own contatos" ON public.contatos;
DROP POLICY "Advogados can update own contatos" ON public.contatos;
DROP POLICY "Advogados can delete own contatos" ON public.contatos;

CREATE POLICY "Advogados can view own contatos" ON public.contatos FOR SELECT TO authenticated USING (auth.uid() = advogado_id);
CREATE POLICY "Advogados can insert own contatos" ON public.contatos FOR INSERT TO authenticated WITH CHECK (auth.uid() = advogado_id);
CREATE POLICY "Advogados can update own contatos" ON public.contatos FOR UPDATE TO authenticated USING (auth.uid() = advogado_id);
CREATE POLICY "Advogados can delete own contatos" ON public.contatos FOR DELETE TO authenticated USING (auth.uid() = advogado_id);

-- Mensagens
DROP POLICY "Advogados can view own mensagens" ON public.mensagens;
DROP POLICY "Advogados can insert own mensagens" ON public.mensagens;

CREATE POLICY "Advogados can view own mensagens" ON public.mensagens FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM contatos WHERE contatos.id = mensagens.contato_id AND contatos.advogado_id = auth.uid()));
CREATE POLICY "Advogados can insert own mensagens" ON public.mensagens FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM contatos WHERE contatos.id = mensagens.contato_id AND contatos.advogado_id = auth.uid()));

-- Alertas
DROP POLICY "Advogados can view own alertas" ON public.alertas;
DROP POLICY "Advogados can insert own alertas" ON public.alertas;
DROP POLICY "Advogados can update own alertas" ON public.alertas;
DROP POLICY "Advogados can delete own alertas" ON public.alertas;

CREATE POLICY "Advogados can view own alertas" ON public.alertas FOR SELECT TO authenticated USING (auth.uid() = advogado_id);
CREATE POLICY "Advogados can insert own alertas" ON public.alertas FOR INSERT TO authenticated WITH CHECK (auth.uid() = advogado_id);
CREATE POLICY "Advogados can update own alertas" ON public.alertas FOR UPDATE TO authenticated USING (auth.uid() = advogado_id);
CREATE POLICY "Advogados can delete own alertas" ON public.alertas FOR DELETE TO authenticated USING (auth.uid() = advogado_id);

-- Relatorios
DROP POLICY "Advogados can view own relatorios" ON public.relatorios;
DROP POLICY "Advogados can insert own relatorios" ON public.relatorios;
DROP POLICY "Advogados can delete own relatorios" ON public.relatorios;

CREATE POLICY "Advogados can view own relatorios" ON public.relatorios FOR SELECT TO authenticated USING (auth.uid() = advogado_id);
CREATE POLICY "Advogados can insert own relatorios" ON public.relatorios FOR INSERT TO authenticated WITH CHECK (auth.uid() = advogado_id);
CREATE POLICY "Advogados can delete own relatorios" ON public.relatorios FOR DELETE TO authenticated USING (auth.uid() = advogado_id);

-- Configuracoes
DROP POLICY "Users can view own config" ON public.configuracoes;
DROP POLICY "Users can insert own config" ON public.configuracoes;
DROP POLICY "Users can update own config" ON public.configuracoes;
DROP POLICY "Users can delete own config" ON public.configuracoes;

CREATE POLICY "Users can view own config" ON public.configuracoes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own config" ON public.configuracoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own config" ON public.configuracoes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own config" ON public.configuracoes FOR DELETE TO authenticated USING (auth.uid() = user_id);
