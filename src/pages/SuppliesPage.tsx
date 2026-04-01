import { useState } from 'react';
import { useAppData } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SUPPLY_CATEGORY_LABELS, SUPPLY_UNIT_LABELS, type Supply, type SupplyCategory, type SupplyUnit } from '@/types';

const EMPTY: Omit<Supply, 'id'> = { name: '', category: 'cloro', unit: 'kg', currentStock: 0, minimumStock: 0, notes: '' };

export default function SuppliesPage() {
  const { supplies, addSupply, updateSupply, deleteSupply } = useAppData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);
  const [form, setForm] = useState<Omit<Supply, 'id'>>(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (s: Supply) => { setEditing(s); setForm(s); setOpen(true); };
  const save = () => {
    if (!form.name.trim()) return;
    if (editing) updateSupply({ ...editing, ...form });
    else addSupply(form);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insumos</h1>
          <p className="text-muted-foreground text-sm mt-1">{supplies.length} insumos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} size="lg" className="field-touch"><Plus className="h-5 w-5 mr-2" /> Novo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Nome do Produto *</Label><Input className="field-touch mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as SupplyCategory })}>
                  <SelectTrigger className="field-touch mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SUPPLY_CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unidade de Medida</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v as SupplyUnit })}>
                  <SelectTrigger className="field-touch mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SUPPLY_UNIT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Estoque Atual</Label><Input type="number" className="field-touch mt-1" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: Number(e.target.value) })} /></div>
                <div><Label>Estoque Mínimo</Label><Input type="number" className="field-touch mt-1" value={form.minimumStock} onChange={e => setForm({ ...form, minimumStock: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Observações</Label><Textarea className="mt-1" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={save} size="lg" className="w-full field-touch">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {supplies.map(s => {
          const lowStock = s.currentStock <= s.minimumStock;
          return (
            <Card key={s.id} className={lowStock ? 'border-warning/40' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2.5 ${lowStock ? 'bg-warning/10' : 'bg-primary/10'}`}>
                      {lowStock ? <AlertTriangle className="h-5 w-5 text-warning" /> : <Package className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{SUPPLY_CATEGORY_LABELS[s.category]}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={lowStock ? 'destructive' : 'secondary'} className="text-xs">
                          {s.currentStock} {SUPPLY_UNIT_LABELS[s.unit]}
                        </Badge>
                        {lowStock && <span className="text-xs text-warning font-medium">Estoque baixo!</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => deleteSupply(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
