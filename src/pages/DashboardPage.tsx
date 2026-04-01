import { useAppData } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Wrench, Package, AlertTriangle, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SUPPLY_CATEGORY_LABELS, CHECKLIST_ITEMS, SUPPLY_UNIT_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const CHART_COLORS = ['hsl(199,89%,32%)', 'hsl(168,76%,36%)', 'hsl(38,92%,50%)', 'hsl(280,60%,50%)', 'hsl(0,72%,51%)'];

export default function DashboardPage() {
  const { locations, maintenances, supplies, employees, getLowStockSupplies } = useAppData();
  const { isAdmin, user } = useAuth();

  // For technicians, show only their maintenances
  const userMaintenances = isAdmin
    ? maintenances
    : maintenances.filter(m => m.employeeId === user?.id);

  if (!isAdmin) {
    return <TechnicianDashboard maintenances={userMaintenances} locations={locations} employees={employees} supplies={supplies} />;
  }

  // Admin dashboard
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthMaintenances = maintenances.filter(m => m.date.startsWith(currentMonth));
  const lowStock = getLowStockSupplies();

  const maintByLocation = locations.map(loc => ({
    name: loc.name.length > 15 ? loc.name.slice(0, 15) + '…' : loc.name,
    count: maintenances.filter(m => m.locationId === loc.id).length,
  }));

  const supplyConsumption: Record<string, number> = {};
  maintenances.forEach(m => {
    m.usedSupplies.forEach(us => {
      const supply = supplies.find(s => s.id === us.supplyId);
      if (supply) {
        const cat = SUPPLY_CATEGORY_LABELS[supply.category];
        supplyConsumption[cat] = (supplyConsumption[cat] || 0) + us.quantity;
      }
    });
  });
  const supplyChartData = Object.entries(supplyConsumption).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">Dashboard <span className="text-primary text-sm font-normal bg-primary/10 px-2 py-0.5 rounded-full">oi</span></h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-primary/10 p-3"><MapPin className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{locations.length}</p>
              <p className="text-xs text-muted-foreground">Locais Cadastrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-accent/10 p-3"><Wrench className="h-6 w-6 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{monthMaintenances.length}</p>
              <p className="text-xs text-muted-foreground">Manutenções no Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-secondary p-3"><Package className="h-6 w-6 text-secondary-foreground" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{supplies.length}</p>
              <p className="text-xs text-muted-foreground">Insumos Cadastrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-warning/10 p-3"><AlertTriangle className="h-6 w-6 text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lowStock.length}</p>
              <p className="text-xs text-muted-foreground">Alertas de Estoque</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="text-warning font-semibold">{s.currentStock} / {s.minimumStock} (mín.)</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Manutenções por Local</CardTitle></CardHeader>
          <CardContent className="h-64">
            {maintByLocation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintByLocation}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(199,89%,32%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Nenhuma manutenção registrada</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Consumo de Insumos</CardTitle></CardHeader>
          <CardContent className="h-64">
            {supplyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={supplyChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {supplyChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Nenhum consumo registrado</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Technician-only dashboard: just their history
function TechnicianDashboard({ maintenances, locations, employees, supplies }: {
  maintenances: any[];
  locations: any[];
  employees: any[];
  supplies: any[];
}) {
  const getLocationName = (id: string) => locations.find((l: any) => l.id === id)?.name ?? 'Desconhecido';
  const getSupplyName = (id: string) => supplies.find((s: any) => s.id === id)?.name ?? '';
  const getSupplyUnit = (id: string) => { const s = supplies.find((s: any) => s.id === id); return s ? SUPPLY_UNIT_LABELS[s.unit] : ''; };
  const sorted = [...maintenances].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">Meu Painel <span className="text-primary text-sm font-normal bg-primary/10 px-2 py-0.5 rounded-full">oi</span></h1>
        <p className="text-muted-foreground text-sm mt-1">Suas manutenções realizadas</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-primary/10 p-3"><ClipboardList className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{maintenances.length}</p>
              <p className="text-xs text-muted-foreground">Total de Manutenções</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-accent/10 p-3"><Wrench className="h-6 w-6 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {maintenances.filter(m => m.date.startsWith(format(new Date(), 'yyyy-MM'))).length}
              </p>
              <p className="text-xs text-muted-foreground">Este Mês</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Últimas Manutenções</h2>
        {sorted.length === 0 && (
          <div className="text-center text-muted-foreground py-12">Nenhuma manutenção registrada ainda</div>
        )}
        <div className="space-y-4">
          {sorted.slice(0, 10).map(m => {
            const doneChecks = Object.entries(m.checklist).filter(([, v]) => v).map(([k]) => CHECKLIST_ITEMS[k]).filter(Boolean);
            const usedSup = m.usedSupplies.filter((us: any) => us.supplyId);
            return (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{getLocationName(m.locationId)}</CardTitle>
                    <Badge variant="secondary">{m.date}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.startTime && `${m.startTime}`}{m.endTime && ` – ${m.endTime}`}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-3 text-sm">
                    {m.ph !== null && <span className="bg-muted px-2 py-1 rounded text-foreground">pH: {m.ph}</span>}
                    {m.chlorine !== null && <span className="bg-muted px-2 py-1 rounded text-foreground">Cloro: {m.chlorine}</span>}
                    {m.turbidity !== null && <span className="bg-muted px-2 py-1 rounded text-foreground">Turbidez: {m.turbidity}</span>}
                    {m.temperature !== null && <span className="bg-muted px-2 py-1 rounded text-foreground">Temp: {m.temperature}°C</span>}
                  </div>
                  {doneChecks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {doneChecks.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                    </div>
                  )}
                  {usedSup.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Insumos: </span>
                      {usedSup.map((us: any, i: number) => (
                        <span key={i}>{getSupplyName(us.supplyId)} ({us.quantity} {getSupplyUnit(us.supplyId)}){i < usedSup.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  )}
                  {m.notes && <p className="text-sm text-muted-foreground italic">{m.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
