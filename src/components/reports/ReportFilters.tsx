import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReportFiltersProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export default function ReportFilters({ from, to, onFromChange, onToChange }: ReportFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-xs">De</Label>
          <Input type="date" className="field-touch mt-1" value={from} onChange={e => onFromChange(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Até</Label>
          <Input type="date" className="field-touch mt-1" value={to} onChange={e => onToChange(e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
}
