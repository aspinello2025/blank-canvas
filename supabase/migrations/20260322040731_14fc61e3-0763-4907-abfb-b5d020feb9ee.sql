
-- Lead status enum
CREATE TYPE public.lead_status AS ENUM (
  'novo', 'contato_iniciado', 'qualificado', 'proposta_enviada', 'negociacao', 'fechado_ganho', 'perdido'
);

-- Lead origin enum
CREATE TYPE public.lead_origin AS ENUM (
  'google', 'facebook', 'instagram', 'indicacao', 'site', 'outro'
);

-- Lead tag enum
CREATE TYPE public.lead_tag AS ENUM ('quente', 'morno', 'frio', 'urgente');

-- Activity type enum
CREATE TYPE public.activity_type AS ENUM ('ligacao', 'whatsapp', 'reuniao', 'proposta', 'email', 'outro');

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  origin lead_origin NOT NULL DEFAULT 'outro',
  interest TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status lead_status NOT NULL DEFAULT 'novo',
  responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  proposal_value NUMERIC DEFAULT 0,
  proposal_date DATE,
  proposal_status TEXT DEFAULT '',
  lost_reason TEXT DEFAULT '',
  tag lead_tag,
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead activities table
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type activity_type NOT NULL DEFAULT 'outro',
  notes TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead tasks (follow-ups)
CREATE TABLE public.lead_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins full access on leads" ON public.leads FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update assigned leads" ON public.leads FOR UPDATE TO authenticated USING (responsible_id = auth.uid()) WITH CHECK (responsible_id = auth.uid());

-- RLS Policies for lead_activities
CREATE POLICY "Authenticated users can view lead_activities" ON public.lead_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert lead_activities" ON public.lead_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins full access on lead_activities" ON public.lead_activities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for lead_tasks
CREATE POLICY "Authenticated users can view lead_tasks" ON public.lead_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert lead_tasks" ON public.lead_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update lead_tasks" ON public.lead_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access on lead_tasks" ON public.lead_tasks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
