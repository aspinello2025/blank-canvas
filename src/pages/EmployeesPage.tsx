import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { EmployeeStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeRow {
  id: string;
  name: string;
  phone: string;
  username: string;
  role: string;
  status: string;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function EmployeesPage() {
  const { createTechnician, isAdmin } = useAuth();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', username: '', role: 'Técnico de Campo', status: 'ativo' as EmployeeStatus, password: '' });
  const [saving, setSaving] = useState(false);

  const fetchEmployees = useCallback(async () => {
    const { data, error } = await supabase.from('employees').select('*').order('name');
    if (error) {
      console.error('Error fetching employees:', error);
      toast.error('Erro ao carregar funcionários');
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', phone: '', username: '', role: 'Técnico de Campo', status: 'ativo', password: '' });
    setOpen(true);
  };

  const openEdit = (emp: EmployeeRow) => {
    setEditing(emp);
    setForm({ name: emp.name, phone: emp.phone || '', username: emp.username || '', role: emp.role, status: emp.status as EmployeeStatus, password: '' });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      if (editing) {
        // Update employee record in DB
        const { error } = await supabase
          .from('employees')
          .update({ name: form.name, phone: form.phone, role: form.role, status: form.status, username: form.username })
          .eq('id', editing.id);

        if (error) {
          toast.error(`Erro ao atualizar: ${error.message}`);
          return;
        }

        // If auth user exists and password or username changed, update via edge function
        if (editing.auth_user_id && (form.password || form.username !== editing.username)) {
          const formatEmail = (u: string) => u.includes('@') ? u.trim() : `${u.trim().toLowerCase().replace(/\s+/g, '')}@ssd.local`;

          const { data, error: fnError } = await supabase.functions.invoke('update-user', {
            body: {
              authUserId: editing.auth_user_id,
              email: form.username !== editing.username ? formatEmail(form.username) : undefined,
              password: form.password || undefined,
              fullName: form.name,
            },
          });

          if (fnError || data?.error) {
            toast.error(`Erro ao atualizar credenciais: ${fnError?.message || data?.error}`);
            return;
          }
          toast.success('Funcionário e credenciais atualizados!');
        } else {
          toast.success('Funcionário atualizado!');
        }

        setOpen(false);
        fetchEmployees();
      } else {
        // New employee - create auth user if username provided
        if (form.username && form.password) {
          const authError = await createTechnician(form.username, form.password, form.name);
          if (authError) {
            toast.error(`Erro ao criar acesso: ${authError}`);
            return;
          }
          // The create-user edge function now also inserts into employees table
          toast.success('Funcionário criado com sucesso!');
          setOpen(false);
          // Small delay to let the edge function finish inserting
          setTimeout(() => fetchEmployees(), 1000);
        } else {
          // Insert employee without auth account
          const { error } = await supabase
            .from('employees')
            .insert({ name: form.name, phone: form.phone, username: form.username, role: form.role, status: form.status });

          if (error) {
            toast.error(`Erro ao criar: ${error.message}`);
            return;
          }
          toast.success('Funcionário criado!');
          setOpen(false);
          fetchEmployees();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp: EmployeeRow) => {
    const { error } = await supabase.from('employees').delete().eq('id', emp.id);
    if (error) {
      toast.error(`Erro ao excluir: ${error.message}`);
    } else {
      toast.success('Funcionário excluído');
      fetchEmployees();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground text-sm mt-1">{employees.length} funcionários</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} size="lg" className="field-touch"><Plus className="h-5 w-5 mr-2" /> Novo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Nome Completo *</Label><Input className="field-touch mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Telefone</Label><Input className="field-touch mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>

                <div className="pt-2 border-t mt-2">
                  <Label>Usuário (Login) {!editing && '*'}</Label>
                  <Input type="text" className="field-touch mt-1" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="ex: joaosilva" />
                </div>

                <div>
                  <Label>{editing ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}</Label>
                  <Input type="password" placeholder={editing ? 'Sem alteração' : 'Mínimo 6 caracteres'} className="field-touch mt-1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>

                {!editing && (
                  <p className="text-[10px] text-muted-foreground mt-0">O técnico usará este usuário e senha para logar no sistema.</p>
                )}

                <div className="pt-2"><Label>Cargo</Label><Input className="field-touch mt-1" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as EmployeeStatus })}>
                    <SelectTrigger className="field-touch mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={save} size="lg" className="w-full field-touch" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum funcionário cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map(emp => (
            <Card key={emp.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5"><Users className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-foreground">{emp.name}</h3>
                    <p className="text-xs text-muted-foreground">{emp.role} {emp.username && `• ${emp.username}`}</p>
                    <Badge variant={emp.status === 'ativo' ? 'default' : 'secondary'} className="mt-1 text-xs">{emp.status === 'ativo' ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(emp)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(emp)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
