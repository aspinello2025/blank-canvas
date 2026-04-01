import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Maintenance, Location, Supply } from '@/types';
import { SUPPLY_UNIT_LABELS } from '@/types';

interface Props {
  filtered: Maintenance[];
  locations: Location[];
  supplies: Supply[];
  onExport: (title: string) => void;
}

export default function SupplyConsumptionTab({ filtered, locations, supplies, onExport }: Props) {
  const { tableData, chartData } = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    filtered.forEach(m => {
      if (!map[m.locationId]) map[m.locationId] = {};
      m.usedSupplies.forEach(us => {
        map[m.locationId][us.supplyId] = (map[m.locationId][us.supplyId] || 0) + us.quantity;
      });
    });

    const tableData: { locName: string; supplyName: string; qty: number; unit: string }[] = [];
    const locTotals: Record<string, number> = {};

    Object.entries(map).forEach(([locId, supMap]) => {
      const loc = locations.find(l => l.id === locId);
      let locTotal = 0;
      Object.entries(supMap).forEach(([supId, qty]) => {
        const s = supplies.find(s => s.id === supId);
        tableData.push({
          locName: loc?.name || 'Desconhecido',
          supplyName: s?.name || 'Removido',
          qty,
          unit: s ? SUPPLY_UNIT_LABELS[s.unit] : '',
        });
        locTotal += qty;
      });
      locTotals[loc?.name || 'Desconhecido'] = locTotal;
    });

    const chartData = Object.entries(locTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, total }));

    return { tableData, chartData };
  }, [filtered, locations, supplies]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">📦 Consumo de Insumos por Local</CardTitle>
        <Button variant="outline" size="sm" onClick={() => onExport('Consumo de Insumos por Local')}>
          <FileText className="h-4 w-4 mr-1" /> Exportar PDF
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Local</TableHead>
                <TableHead>Insumo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
              )}
              {tableData.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{d.locName}</TableCell>
                  <TableCell>{d.supplyName}</TableCell>
                  <TableCell className="text-right">{d.qty} {d.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
