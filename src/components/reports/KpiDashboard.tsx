import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import type { Maintenance, Location, Employee, Supply } from '@/types';
import { SUPPLY_UNIT_LABELS } from '@/types';

interface ContractData {
  locationId: string;
  monthlyValue: number;
  laborCostPerVisit: number;
}

interface KpiDashboardProps {
  filtered: Maintenance[];
  locations: Location[];
  employees: Employee[];
  supplies: Supply[];
  contracts: ContractData[];
}

export default function KpiDashboard({ filtered, locations, employees, supplies, contracts }: KpiDashboardProps) {
  const kpis = useMemo(() => {
    // Cost per location
    const locationCosts: Record<string, number> = {};
    filtered.forEach(m => {
      const contract = contracts.find(c => c.locationId === m.locationId);
      const laborCost = contract?.laborCostPerVisit ?? 150;
      let supplyCost = 0;
      m.usedSupplies.forEach(us => {
        supplyCost += us.quantity * 10; // estimated unit cost
      });
      locationCosts[m.locationId] = (locationCosts[m.locationId] || 0) + laborCost + supplyCost;
    });

    const highestCostLocId = Object.entries(locationCosts).sort((a, b) => b[1] - a[1])[0];
    const highestCostLoc = highestCostLocId ? locations.find(l => l.id === highestCostLocId[0]) : null;

    // Most profitable contract
    let bestProfit = { name: '—', margin: 0 };
    contracts.forEach(c => {
      if (c.monthlyValue <= 0) return;
      const cost = locationCosts[c.locationId] || 0;
      const margin = ((c.monthlyValue - cost) / c.monthlyValue) * 100;
      if (margin > bestProfit.margin || bestProfit.name === '—') {
        const loc = locations.find(l => l.id === c.locationId);
        bestProfit = { name: loc?.name || '—', margin };
      }
    });

    // Most productive employee
    const empCount: Record<string, number> = {};
    filtered.forEach(m => {
      const empId = m.employeeId;
      empCount[empId] = (empCount[empId] || 0) + 1;
    });
    const topEmpId = Object.entries(empCount).sort((a, b) => b[1] - a[1])[0];
    const topEmp = topEmpId ? (employees.find(e => e.id === topEmpId[0]) || employees.find(e => e.authUserId === topEmpId[0])) : null;

    // Location with most visits
    const locCount: Record<string, number> = {};
    filtered.forEach(m => { locCount[m.locationId] = (locCount[m.locationId] || 0) + 1; });
    const topLocId = Object.entries(locCount).sort((a, b) => b[1] - a[1])[0];
    const topLoc = topLocId ? locations.find(l => l.id === topLocId[0]) : null;

    return {
      highestCost: highestCostLoc ? `${highestCostLoc.name}` : '—',
      highestCostValue: highestCostLocId ? `R$ ${highestCostLocId[1].toFixed(0)}` : '',
      bestProfit: bestProfit.name,
      bestMargin: bestProfit.margin > 0 ? `${bestProfit.margin.toFixed(0)}%` : '—',
      topEmployee: topEmp?.name || '—',
      topEmployeeCount: topEmpId ? `${topEmpId[1]} serviços` : '',
      topLocation: topLoc?.name || '—',
      topLocationCount: topLocId ? `${topLocId[1]} visitas` : '',
    };
  }, [filtered, locations, employees, contracts]);

  const cards = [
    { icon: DollarSign, label: 'Maior Custo', value: kpis.highestCost, sub: kpis.highestCostValue, color: 'text-red-500 bg-red-500/10' },
    { icon: TrendingUp, label: 'Mais Lucrativo', value: kpis.bestProfit, sub: kpis.bestMargin, color: 'text-emerald-500 bg-emerald-500/10' },
    { icon: Award, label: 'Mais Produtivo', value: kpis.topEmployee, sub: kpis.topEmployeeCount, color: 'text-blue-500 bg-blue-500/10' },
    { icon: AlertTriangle, label: 'Mais Visitas', value: kpis.topLocation, sub: kpis.topLocationCount, color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">KPI Dashboard</span>
        <span className="text-[10px] font-normal text-muted-foreground italic">oi</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
                  <p className="text-sm font-bold truncate">{c.value}</p>
                  {c.sub && <p className="text-xs text-muted-foreground">{c.sub}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
