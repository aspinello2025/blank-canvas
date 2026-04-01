
-- Create locations table
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text DEFAULT '',
  structure_type text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  responsible text DEFAULT '',
  phone text DEFAULT '',
  frequency text DEFAULT '',
  notes text DEFAULT '',
  water_volume numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view locations" ON public.locations
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins full access on locations" ON public.locations
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create supplies table
CREATE TABLE public.supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT '',
  unit text DEFAULT '',
  current_stock numeric DEFAULT 0,
  minimum_stock numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view supplies" ON public.supplies
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins full access on supplies" ON public.supplies
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create checklist_templates table
CREATE TABLE public.checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  process_number text DEFAULT '',
  company_name text DEFAULT '',
  location_name text DEFAULT '',
  address text DEFAULT '',
  responsible_employee text DEFAULT '',
  equipment jsonb DEFAULT '[]',
  questions jsonb DEFAULT '[]',
  include_photos boolean DEFAULT true,
  signatories jsonb DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates" ON public.checklist_templates
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins full access on templates" ON public.checklist_templates
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplies_updated_at BEFORE UPDATE ON public.supplies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON public.checklist_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
