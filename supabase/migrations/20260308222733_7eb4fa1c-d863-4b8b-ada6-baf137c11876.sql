
-- Allow delete on profiles for account deletion
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow delete on configuracoes
CREATE POLICY "Users can delete own config" ON public.configuracoes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow delete on relatorios
CREATE POLICY "Advogados can delete own relatorios" ON public.relatorios FOR DELETE TO authenticated USING (auth.uid() = advogado_id);

-- Allow delete on alertas
CREATE POLICY "Advogados can delete own alertas" ON public.alertas FOR DELETE TO authenticated USING (auth.uid() = advogado_id);
