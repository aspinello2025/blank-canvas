
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text DEFAULT '',
  username text DEFAULT '',
  role text NOT NULL DEFAULT 'Técnico de Campo',
  status text NOT NULL DEFAULT 'ativo',
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins full access on employees" ON public.employees
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Technicians can view employees
CREATE POLICY "Authenticated users can view employees" ON public.employees
FOR SELECT TO authenticated
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
