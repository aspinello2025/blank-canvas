import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Maintenance, Location } from '@/types';

interface ContractData {
  locationId: string;
  monthlyValue: number;
  laborCostPerVisit: number;
}

interface Props {
  filtered: Maintenance[];
  locations: Location[];
  contracts: ContractData[];
  onContractsChange: () => void;
  onExport: (title: string) => void;
}

export default function ProfitTab({ filtered, locations, contracts, onContractsChange, onExport }: Props) {
  const [editLoc, setEditLoc] = useState<Location | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editLabor, setEditLabor] = useState('');

  const data = useMemo(() => {
    const costMap: Record<string, number> = {};
    filtered.forEach(m => {
      const contract = contracts.find(c => c.locationId === m.locationId);
      const labor = contract?.laborCostPerVisit ?? 150;
      let supply = 0;
      m.usedSupplies.forEach(us => { supply += us.quantity * 10; });
      costMap[m.locationId] = (costMap[m.locationId] || 0) + labor + supply;
    });

    return locations.map(loc => {
      const contract = contracts.find(c => c.locationId === loc.id);
      const revenue = contract?.monthlyValue ?? 0;
      const cost = costMap[loc.id] || 0;
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      return { loc, revenue, cost, profit, margin, hasContract: !!contract && revenue > 0 };
    }).filter(d => d.hasContract || d.cost > 0).sort((a, b) => b.margin - a.margin);
  }, [filtered, locations, contracts]);

  const handleSave = async () => {
    if (!editLoc) return;
    const db = supabase as any;
    const existing = contracts.find(c => c.locationId === editLoc.id);
    if (existing) {
      await db.from('location_contracts').update({
        monthly_value: parseFloat(editValue) || 0,
        labor_cost_per_visit: parseFloat(editLabor) || 150,
      }).eq('location_id', editLoc.id);
    } else {
      await db.from('location_contracts').insert({
        location_id: editLoc.id,
        monthly_value: parseFloat(editValue) || 0,
        labor_cost_per_visit: parseFloat(editLabor) || 150,
      });
    }
    setEditLoc(null);
    onContractsChange();
  };

  const openEdit = (loc: Location) => {
    const c = contracts.find(c => c.locationId === loc.id);
    setEditValue(c?.monthlyValue?.toString() || '0');
    setEditLabor(c?.laborCostPerVisit?.toString() || '150');
    setEditLoc(loc);
  };

  const getMarginBadge = (margin: number, hasContract: boolean) => {
    if (!hasContract) return <Badge variant="outline" className="text-[10px]">Sem contrato</Badge>;
    if (margin < 0) return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[10px]">{margin.toFixed(0)}%</Badge>;
    if (margin < 20) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]">{margin.toFixed(0)}%</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px]">{margin.toFixed(0)}%</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">📈 Lucro por Contrato</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onExport('Lucro por Contrato')}>
            <FileText className="h-4 w-4 mr-1" /> Exportar PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-center">Margem</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
                )}
                {data.map(d => (
                  <TableRow key={d.loc.id} className={d.profit < 0 ? 'bg-red-50/50 dark:bg-red-950/10' : ''}>
                    <TableCell className="font-medium">{d.loc.name}</TableCell>
                    <TableCell className="text-right">R$ {d.revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {d.cost.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-semibold ${d.profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      R$ {d.profit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">{getMarginBadge(d.margin, d.hasContract)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(d.loc)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editLoc} onOpenChange={o => !o && setEditLoc(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Contrato - {editLoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Valor Mensal do Contrato (R$)</Label>
              <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Custo de Mão de Obra por Visita (R$)</Label>
              <Input type="number" value={editLabor} onChange={e => setEditLabor(e.target.value)} className="mt-1" />
            </div>
            <Button className="w-full" onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
