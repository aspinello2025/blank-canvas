import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import type { Maintenance, Location } from '@/types';

interface Props {
  filtered: Maintenance[];
  locations: Location[];
  onExport: (title: string) => void;
}

export default function OccurrencesTab({ filtered, locations, onExport }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { visits: number; issues: number }> = {};
    filtered.forEach(m => {
      if (!map[m.locationId]) map[m.locationId] = { visits: 0, issues: 0 };
      map[m.locationId].visits++;
      // Count out-of-range parameters as issues
      if (m.ph && (m.ph < 7 || m.ph > 7.4)) map[m.locationId].issues++;
      if (m.chlorine && (m.chlorine < 1 || m.chlorine > 3)) map[m.locationId].issues++;
      // Count irregularity photos
      const irregularities = m.photos.filter(p => p.type === 'irregularidade').length;
      map[m.locationId].issues += irregularities;
    });

    return Object.entries(map).map(([locId, d]) => {
      const loc = locations.find(l => l.id === locId);
      const criticality = d.issues > 5 ? 'alto' : d.issues > 2 ? 'medio' : 'baixo';
      return { name: loc?.name || 'Desconhecido', visits: d.visits, issues: d.issues, criticality };
    }).sort((a, b) => b.issues - a.issues);
  }, [filtered, locations]);

  const getBadge = (c: string) => {
    if (c === 'alto') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[10px]">Alto</Badge>;
    if (c === 'medio') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]">Médio</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px]">Baixo</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">⚠️ Locais com Mais Ocorrências</CardTitle>
        <Button variant="outline" size="sm" onClick={() => onExport('Locais com Mais Ocorrências')}>
          <FileText className="h-4 w-4 mr-1" /> Exportar PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Local</TableHead>
                <TableHead className="text-center">Total de Visitas</TableHead>
                <TableHead className="text-center">Ocorrências</TableHead>
                <TableHead className="text-center">Criticidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
              )}
              {data.map(d => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-center">{d.visits}</TableCell>
                  <TableCell className="text-center font-semibold">{d.issues}</TableCell>
                  <TableCell className="text-center">{getBadge(d.criticality)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
