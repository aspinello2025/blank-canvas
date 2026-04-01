import { useState } from 'react';
import { useAppData } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, MapPin, Phone, User, Calendar, FileText, Home, ChevronRight } from 'lucide-react';
import { STRUCTURE_TYPE_LABELS, FREQUENCY_LABELS, type Location, type StructureType, type MaintenanceFrequency } from '@/types';

const EMPTY: Omit<Location, 'id'> = { name: '', cnpj: '', structureType: 'Piscina Pública', address: '', city: '', responsible: '', phone: '', frequency: 'semanal', notes: '' };

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="rounded-lg bg-primary/10 p-2 shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function LocationsPage() {
  const { locations, addLocation, updateLocation, deleteLocation } = useAppData();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Location | null>(null);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<Omit<Location, 'id'>>(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (loc: Location) => { setEditing(loc); setForm(loc); setOpen(true); };
  const openDetail = (loc: Location) => { setViewing(loc); setDetailOpen(true); };
  const save = () => {
    if (!form.name.trim()) return;
    if (editing) updateLocation({ ...editing, ...form });
    else addLocation(form);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locais</h1>
          <p className="text-muted-foreground text-sm mt-1">{locations.length} locais cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} size="lg" className="field-touch"><Plus className="h-5 w-5 mr-2" /> Novo Local</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Editar Local' : 'Novo Local'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Nome do Local *</Label><Input className="field-touch mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>CNPJ</Label><Input className="field-touch mt-1" placeholder="00.000.000/0001-00" value={form.cnpj || ''} onChange={e => setForm({ ...form, cnpj: e.target.value })} /></div>
              <div>
                <Label>Tipo de Estrutura</Label>
                <Input 
                  list="structure-types"
                  className="field-touch mt-1" 
                  value={form.structureType} 
                  onChange={e => setForm({ ...form, structureType: e.target.value })} 
                  placeholder="Ex: Piscina, Fonte, Lago..."
                />
                <datalist id="structure-types">
                  {Object.values(STRUCTURE_TYPE_LABELS).map(label => <option key={label} value={label} />)}
                </datalist>
              </div>
              <div><Label>Endereço</Label><Input className="field-touch mt-1" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Cidade</Label><Input className="field-touch mt-1" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Responsável</Label><Input className="field-touch mt-1" value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input className="field-touch mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Frequência de Manutenção</Label>
                <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v as MaintenanceFrequency })}>
                  <SelectTrigger className="field-touch mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(FREQUENCY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Observações</Label><Textarea className="mt-1" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} size="lg" className="w-full field-touch">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{viewing.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{viewing.structureType}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-2">
                {viewing.cnpj && (
                  <DetailRow
                    icon={<FileText className="h-4 w-4 text-primary" />}
                    label="CNPJ"
                    value={viewing.cnpj}
                  />
                )}
                <DetailRow
                  icon={<Home className="h-4 w-4 text-primary" />}
                  label="Endereço"
                  value={[viewing.address, viewing.city].filter(Boolean).join(', ')}
                />
                <DetailRow
                  icon={<User className="h-4 w-4 text-primary" />}
                  label="Responsável"
                  value={viewing.responsible}
                />
                <DetailRow
                  icon={<Phone className="h-4 w-4 text-primary" />}
                  label="Telefone"
                  value={viewing.phone}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4 text-primary" />}
                  label="Frequência de Manutenção"
                  value={FREQUENCY_LABELS[viewing.frequency]}
                />
                {viewing.notes && (
                  <DetailRow
                    icon={<FileText className="h-4 w-4 text-primary" />}
                    label="Observações"
                    value={viewing.notes}
                  />
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setDetailOpen(false); openEdit(viewing); }}
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => { deleteLocation(viewing.id); setDetailOpen(false); }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {locations.map(loc => (
          <Card
            key={loc.id}
            className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/40"
            onClick={() => openDetail(loc)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 mt-0.5"><MapPin className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-foreground">{loc.name}</h3>
                    {loc.cnpj && <p className="text-[10px] text-muted-foreground font-mono">CNPJ: {loc.cnpj}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">{STRUCTURE_TYPE_LABELS[loc.structureType as keyof typeof STRUCTURE_TYPE_LABELS] || loc.structureType}</p>
                    <p className="text-xs text-muted-foreground mt-1">{loc.city}{loc.city && loc.frequency ? ' • ' : ''}{FREQUENCY_LABELS[loc.frequency]}</p>
                    {loc.responsible && <p className="text-xs text-muted-foreground mt-0.5">👤 {loc.responsible}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(loc); }}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteLocation(loc.id); }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
