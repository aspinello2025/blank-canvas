import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Trophy } from 'lucide-react';
import type { Maintenance, Employee } from '@/types';

interface Props {
  filtered: Maintenance[];
  employees: Employee[];
  onExport: (title: string) => void;
}

export default function ProductivityTab({ filtered, employees, onExport }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { count: number; services: number }> = {};
    filtered.forEach(m => {
      if (!map[m.employeeId]) map[m.employeeId] = { count: 0, services: 0 };
      map[m.employeeId].count++;
      const servicesDone = Object.values(m.checklist).filter(v => v === true).length;
      map[m.employeeId].services += servicesDone;
    });

    return Object.entries(map).map(([empId, d]) => {
      const emp = employees.find(e => e.id === empId) || employees.find(e => e.authUserId === empId);
      return {
        name: emp?.name || 'Desconhecido',
        count: d.count,
        services: d.services,
      };
    }).sort((a, b) => b.count - a.count);
  }, [filtered, employees]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">👷 Produtividade dos Funcionários</CardTitle>
        <Button variant="outline" size="sm" onClick={() => onExport('Produtividade dos Funcionários')}>
          <FileText className="h-4 w-4 mr-1" /> Exportar PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Funcionário</TableHead>
                <TableHead className="text-center">Manutenções</TableHead>
                <TableHead className="text-center">Serviços Executados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
              )}
              {data.map((d, i) => (
                <TableRow key={d.name} className={i < 3 ? 'bg-primary/5' : ''}>
                  <TableCell className="text-center text-lg">
                    {i < 3 ? medals[i] : i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {d.name}
                    {i === 0 && <Badge className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]">Top</Badge>}
                  </TableCell>
                  <TableCell className="text-center font-semibold">{d.count}</TableCell>
                  <TableCell className="text-center">{d.services}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
