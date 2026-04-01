import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import type { Maintenance, Location, Supply } from '@/types';

interface ContractData {
  locationId: string;
  monthlyValue: number;
  laborCostPerVisit: number;
}

interface Props {
  filtered: Maintenance[];
  locations: Location[];
  supplies: Supply[];
  contracts: ContractData[];
  onExport: (title: string) => void;
}

export default function CostPerClientTab({ filtered, locations, supplies, contracts, onExport }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { count: number; supplyCost: number; laborCost: number }> = {};
    filtered.forEach(m => {
      if (!map[m.locationId]) map[m.locationId] = { count: 0, supplyCost: 0, laborCost: 0 };
      map[m.locationId].count++;
      const contract = contracts.find(c => c.locationId === m.locationId);
      map[m.locationId].laborCost += contract?.laborCostPerVisit ?? 150;
      m.usedSupplies.forEach(us => {
        map[m.locationId].supplyCost += us.quantity * 10;
      });
    });
    return Object.entries(map).map(([locId, d]) => {
      const loc = locations.find(l => l.id === locId);
      const total = d.supplyCost + d.laborCost;
      return {
        name: loc?.name || 'Desconhecido',
        count: d.count,
        total,
        avg: d.count > 0 ? total / d.count : 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [filtered, locations, contracts]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">💰 Custo por Cliente</CardTitle>
        <Button variant="outline" size="sm" onClick={() => onExport('Custo por Cliente')}>
          <FileText className="h-4 w-4 mr-1" /> Exportar PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Cliente / Local</TableHead>
                <TableHead className="text-center">Manutenções</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-right">Custo Médio/Visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sem dados no período</TableCell></TableRow>
              )}
              {data.map(d => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-center">{d.count}</TableCell>
                  <TableCell className="text-right font-semibold">R$ {d.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">R$ {d.avg.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
