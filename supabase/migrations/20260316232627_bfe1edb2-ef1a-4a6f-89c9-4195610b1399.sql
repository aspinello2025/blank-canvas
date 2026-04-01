
CREATE POLICY "Admins can delete employees" ON public.employees
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
