
CREATE TABLE public.location_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text NOT NULL,
  monthly_value numeric NOT NULL DEFAULT 0,
  labor_cost_per_visit numeric NOT NULL DEFAULT 150,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_location_contracts_location_id ON public.location_contracts(location_id);

ALTER TABLE public.location_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on location_contracts"
  ON public.location_contracts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view location_contracts"
  ON public.location_contracts FOR SELECT TO authenticated
  USING (true);
