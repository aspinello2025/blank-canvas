import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead, LeadActivity, LeadTask, LeadStatus, ActivityType, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, ACTIVITY_TYPE_LABELS, LEAD_TAG_LABELS } from '@/types/leads';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, Mail, Building2, Calendar, DollarSign, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lead: Lead | null;
  activities: LeadActivity[];
  tasks: LeadTask[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onAddActivity: (a: { leadId: string; type: string; notes: string }) => Promise<any>;
  onAddTask: (t: { leadId: string; title: string; dueDate: string }) => Promise<any>;
  onToggleTask: (id: string, completed: boolean) => void;
  onConvertToClient?: (lead: Lead) => void;
}

export default function LeadDetail({ lead, activities, tasks, onClose, onUpdate, onDelete, onAddActivity, onAddTask, onToggleTask, onConvertToClient }: Props) {
  const [actType, setActType] = useState<ActivityType>('ligacao');
  const [actNotes, setActNotes] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [proposalValue, setProposalValue] = useState(lead?.proposalValue?.toString() || '0');
  const [lostReason, setLostReason] = useState(lead?.lostReason || '');

  if (!lead) return null;

  const leadActivities = activities.filter(a => a.leadId === lead.id);
  const leadTasks = tasks.filter(t => t.leadId === lead.id);

  const handleAddActivity = async () => {
    if (!actNotes.trim()) { toast.error('Adicione uma observação'); return; }
    await onAddActivity({ leadId: lead.id, type: actType, notes: actNotes });
    setActNotes('');
    toast.success('Atividade registrada!');
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim() || !taskDate) { toast.error('Preencha título e data'); return; }
    await onAddTask({ leadId: lead.id, title: taskTitle, dueDate: new Date(taskDate).toISOString() });
    setTaskTitle('');
    setTaskDate('');
    toast.success('Tarefa agendada!');
  };

  const handleStatusChange = async (status: LeadStatus) => {
    await onUpdate(lead.id, { status });
    toast.success(`Status alterado para ${LEAD_STATUS_LABELS[status]}`);
  };

  const handleSaveProposal = async () => {
    await onUpdate(lead.id, {
      proposalValue: parseFloat(proposalValue) || 0,
      proposalDate: new Date().toISOString().split('T')[0],
    });
    toast.success('Proposta atualizada');
  };

  const handleMarkLost = async () => {
    await onUpdate(lead.id, { status: 'perdido', lostReason });
    toast.success('Lead marcado como perdido');
  };

  return (
    <Sheet open={!!lead} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {lead.name}
            {lead.tag && <Badge variant="outline" className="text-xs">{LEAD_TAG_LABELS[lead.tag]}</Badge>}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {lead.company && <p className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-muted-foreground" />{lead.company}</p>}
            {lead.phone && (
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-primary hover:underline">
                <Phone className="h-4 w-4" />{lead.phone} <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {lead.email && <p className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted-foreground" />{lead.email}</p>}
            <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-muted-foreground" />{format(new Date(lead.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>

          {/* Status */}
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={lead.status} onValueChange={v => handleStatusChange(v as LeadStatus)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {lead.notes && <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{lead.notes}</p>}

          <Tabs defaultValue="activities" className="mt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="tasks">Follow-up</TabsTrigger>
              <TabsTrigger value="proposal">Proposta</TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-3 mt-3">
              <div className="flex gap-2">
                <Select value={actType} onValueChange={v => setActType(v as ActivityType)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTIVITY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={actNotes} onChange={e => setActNotes(e.target.value)} placeholder="Observação..." className="flex-1" />
                <Button size="sm" onClick={handleAddActivity}>Registrar</Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {leadActivities.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>}
                {leadActivities.map(a => (
                  <div key={a.id} className="border rounded p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{ACTIVITY_TYPE_LABELS[a.type]}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(a.createdAt), 'dd/MM HH:mm')}</span>
                    </div>
                    {a.notes && <p className="mt-1 text-muted-foreground">{a.notes}</p>}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-3 mt-3">
              <div className="flex gap-2">
                <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Título da tarefa" className="flex-1" />
                <Input type="datetime-local" value={taskDate} onChange={e => setTaskDate(e.target.value)} className="w-44" />
                <Button size="sm" onClick={handleAddTask}>Agendar</Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {leadTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma tarefa agendada</p>}
                {leadTasks.map(t => (
                  <div key={t.id} className="border rounded p-2 text-sm flex items-center gap-2">
                    <Checkbox checked={t.completed} onCheckedChange={c => onToggleTask(t.id, !!c)} />
                    <div className="flex-1">
                      <p className={cn(t.completed && "line-through text-muted-foreground")}>{t.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.dueDate), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    {!t.completed && new Date(t.dueDate) < new Date() && (
                      <Badge variant="destructive" className="text-[10px]">Atrasada</Badge>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="proposal" className="space-y-3 mt-3">
              <div>
                <Label>Valor da Proposta (R$)</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="number" value={proposalValue} onChange={e => setProposalValue(e.target.value)} className="flex-1" />
                  <Button size="sm" onClick={handleSaveProposal}>Salvar</Button>
                </div>
              </div>
              {lead.proposalDate && <p className="text-xs text-muted-foreground">Enviada em: {format(new Date(lead.proposalDate), 'dd/MM/yyyy')}</p>}

              <div className="flex gap-2 pt-2">
                {lead.status !== 'fechado_ganho' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                    handleStatusChange('fechado_ganho');
                    onConvertToClient?.(lead);
                  }}>
                    ✅ Marcar como Ganho
                  </Button>
                )}
                {lead.status !== 'perdido' && (
                  <div className="flex gap-2 flex-1">
                    <Input placeholder="Motivo da perda" value={lostReason} onChange={e => setLostReason(e.target.value)} className="flex-1" />
                    <Button size="sm" variant="destructive" onClick={handleMarkLost}>Perdido</Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-4 border-t flex justify-between">
            <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
              await onDelete(lead.id);
              onClose();
              toast.success('Lead removido');
            }}>
              <Trash2 className="h-4 w-4 mr-1" />Excluir
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
