
CREATE TABLE public.maintenances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text NOT NULL,
  employee_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  start_time text DEFAULT '',
  end_time text DEFAULT '',
  ph numeric,
  chlorine numeric,
  turbidity numeric,
  temperature numeric,
  template_id text DEFAULT '',
  checklist jsonb NOT NULL DEFAULT '{}',
  used_supplies jsonb NOT NULL DEFAULT '[]',
  photos jsonb NOT NULL DEFAULT '[]',
  notes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view maintenances
CREATE POLICY "Authenticated users can view maintenances" ON public.maintenances
FOR SELECT TO authenticated
USING (true);

-- Authenticated users can insert their own maintenances
CREATE POLICY "Authenticated users can insert maintenances" ON public.maintenances
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own maintenances
CREATE POLICY "Users can update own maintenances" ON public.maintenances
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can update any maintenance
CREATE POLICY "Admins can update any maintenance" ON public.maintenances
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ONLY admins can delete maintenances
CREATE POLICY "Only admins can delete maintenances" ON public.maintenances
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_maintenances_updated_at
  BEFORE UPDATE ON public.maintenances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
