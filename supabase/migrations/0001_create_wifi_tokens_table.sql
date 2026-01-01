-- wifi_tokens table
CREATE TABLE public.wifi_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code_id text NOT NULL,
  ssid character varying NOT NULL,
  password character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  CONSTRAINT wifi_tokens_pkey PRIMARY KEY (id)
);

-- RLS Policies
ALTER TABLE public.wifi_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access" ON public.wifi_tokens
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow individual insert access" ON public.wifi_tokens
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Allow Edge Functions to delete
-- This policy assumes you will use the service_role key from your Edge Function
CREATE POLICY "Allow service_role to delete" ON public.wifi_tokens
AS PERMISSIVE FOR DELETE
TO service_role
USING (true);
