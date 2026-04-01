import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, LayoutGrid, List, BarChart3, Loader2 } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { Lead, LeadStatus, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_ORIGIN_LABELS, LEAD_TAG_LABELS } from '@/types/leads';
import LeadKanban from '@/components/leads/LeadKanban';
import LeadForm from '@/components/leads/LeadForm';
import LeadDetail from '@/components/leads/LeadDetail';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import { useAppData } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LeadsPage() {
  const { leads, activities, tasks, loading, addLead, updateLead, deleteLead, addActivity, addTask, toggleTask } = useLeads();
  const { addLocation } = useAppData();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<'kanban' | 'list' | 'dashboard'>('kanban');

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.email.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await updateLead(id, { status });
    toast.success(`Lead movido para ${LEAD_STATUS_LABELS[status]}`);
  };

  const handleConvertToClient = (lead: Lead) => {
    addLocation({
      name: lead.company || lead.name,
      cnpj: '',
      structureType: '',
      address: '',
      city: '',
      responsible: lead.name,
      phone: lead.phone,
      frequency: 'semanal' as const,
      notes: `Convertido do CRM. Interesse: ${lead.interest}`,
    });
    toast.success('Lead convertido em cliente/local!');
  };

  // Pending follow-ups
  const pendingTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) <= new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leads / CRM</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus leads e funil de vendas</p>
        </div>
        <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Lead</Button>
      </div>

      {/* Pending alerts */}
      {pendingTasks.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
          <p className="font-medium text-destructive">⚠️ {pendingTasks.length} follow-up(s) pendente(s)</p>
        </div>
      )}

      {/* Search + View toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar leads..." className="pl-9" />
        </div>
        <div className="flex border rounded-lg">
          <Button variant={view === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setView('kanban')}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
          <Button variant={view === 'dashboard' ? 'default' : 'ghost'} size="sm" onClick={() => setView('dashboard')}><BarChart3 className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Views */}
      {view === 'kanban' && (
        <LeadKanban leads={filtered} onStatusChange={handleStatusChange} onSelectLead={setSelectedLead} />
      )}

      {view === 'list' && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum lead encontrado</TableCell></TableRow>
              )}
              {filtered.map(lead => (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLead(lead)}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{LEAD_ORIGIN_LABELS[lead.origin]}</TableCell>
                  <TableCell><Badge className={cn('text-xs', LEAD_STATUS_COLORS[lead.status])}>{LEAD_STATUS_LABELS[lead.status]}</Badge></TableCell>
                  <TableCell>{lead.tag ? LEAD_TAG_LABELS[lead.tag] : '-'}</TableCell>
                  <TableCell>{lead.proposalValue > 0 ? `R$ ${lead.proposalValue.toLocaleString('pt-BR')}` : '-'}</TableCell>
                  <TableCell className="text-xs">{format(new Date(lead.createdAt), 'dd/MM/yy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {view === 'dashboard' && <LeadsDashboard leads={filtered} />}

      <LeadForm open={formOpen} onClose={() => setFormOpen(false)} onSave={addLead} />
      <LeadDetail
        lead={selectedLead}
        activities={activities}
        tasks={tasks}
        onClose={() => setSelectedLead(null)}
        onUpdate={updateLead}
        onDelete={deleteLead}
        onAddActivity={addActivity}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onConvertToClient={handleConvertToClient}
      />
    </div>
  );
}
