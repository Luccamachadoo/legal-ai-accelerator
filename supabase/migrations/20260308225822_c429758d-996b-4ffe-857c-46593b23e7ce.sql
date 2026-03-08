
-- Table to store Chatwoot integration settings per user
CREATE TABLE public.integracoes_chatwoot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chatwoot_base_url TEXT NOT NULL DEFAULT '',
  chatwoot_api_token TEXT NOT NULL DEFAULT '',
  chatwoot_account_id TEXT NOT NULL DEFAULT '',
  chatwoot_inbox_id TEXT NOT NULL DEFAULT '',
  webhook_secret TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.integracoes_chatwoot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatwoot config"
  ON public.integracoes_chatwoot FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chatwoot config"
  ON public.integracoes_chatwoot FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chatwoot config"
  ON public.integracoes_chatwoot FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chatwoot config"
  ON public.integracoes_chatwoot FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_integracoes_chatwoot_updated_at
  BEFORE UPDATE ON public.integracoes_chatwoot
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
