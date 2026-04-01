import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppData } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, User, Clock, Calendar, CheckCircle2, Image as ImageIcon, Beaker, ClipboardList, Droplets, ChevronRight } from 'lucide-react';
import { CHECKLIST_ITEMS, SUPPLY_UNIT_LABELS, type Maintenance } from '@/types';
import { supabase } from '@/integrations/supabase/client';

import ReportFilters from '@/components/reports/ReportFilters';
import KpiDashboard from '@/components/reports/KpiDashboard';
import CostPerClientTab from '@/components/reports/CostPerClientTab';
import ProfitTab from '@/components/reports/ProfitTab';
import SupplyConsumptionTab from '@/components/reports/SupplyConsumptionTab';
import ProductivityTab from '@/components/reports/ProductivityTab';
import OccurrencesTab from '@/components/reports/OccurrencesTab';

interface ContractData {
  locationId: string;
  monthlyValue: number;
  laborCostPerVisit: number;
}

export default function ReportsPage() {
  const { maintenances, locations, employees, supplies, checklistTemplates } = useAppData();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedM, setSelectedM] = useState<Maintenance | null>(null);
  const [contracts, setContracts] = useState<ContractData[]>([]);

  const fetchContracts = useCallback(async () => {
    const db = supabase as any;
    const { data } = await db.from('location_contracts').select('*');
    if (data) {
      setContracts(data.map((c: any) => ({
        locationId: c.location_id,
        monthlyValue: c.monthly_value,
        laborCostPerVisit: c.labor_cost_per_visit,
      })));
    }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const filtered = useMemo(() => {
    return maintenances.filter(m => {
      if (from && m.date < from) return false;
      if (to && m.date > to) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [maintenances, from, to]);

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name ?? 'Local desconhecido';
  const getEmployeeName = (id: string) => {
    const byId = employees.find(e => e.id === id);
    if (byId) return byId.name;
    const byAuth = employees.find(e => e.authUserId === id);
    if (byAuth) return byAuth.name;
    return 'Técnico desconhecido';
  };

  const getChecklistLabel = (key: string, templateId?: string) => {
    if (CHECKLIST_ITEMS[key]) return CHECKLIST_ITEMS[key];
    if (templateId) {
      const template = checklistTemplates.find(t => t.id === templateId);
      if (template) {
        const q = template.questions?.find(q => q.id === key);
        if (q) return q.text;
        const eq = template.equipment?.find(eq => `eq-${eq.id}` === key);
        if (eq) return `Inspeção: ${eq.name}`;
      }
    }
    return key;
  };

  const handleExportPDF = (title: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = document.getElementById('report-content');
    printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5}</style></head><body><h2>${title}</h2>${content?.innerHTML ?? ''}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground text-sm mt-1">Painel de decisão para o gestor</p>
      </div>

      <ReportFilters from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <KpiDashboard filtered={filtered} locations={locations} employees={employees} supplies={supplies} contracts={contracts} />

      <Tabs defaultValue="custo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-1 bg-muted/50">
          <TabsTrigger value="custo" className="text-xs">💰 Custos</TabsTrigger>
          <TabsTrigger value="lucro" className="text-xs">📈 Lucro</TabsTrigger>
          <TabsTrigger value="insumos-local" className="text-xs">📦 Insumos</TabsTrigger>
          <TabsTrigger value="produtividade" className="text-xs">👷 Produtividade</TabsTrigger>
          <TabsTrigger value="ocorrencias" className="text-xs">⚠️ Ocorrências</TabsTrigger>
          <TabsTrigger value="manutencoes" className="text-xs">🔧 Manutenções</TabsTrigger>
          <TabsTrigger value="parametros" className="text-xs">🧪 Parâmetros</TabsTrigger>
        </TabsList>

        <TabsContent value="custo">
          <CostPerClientTab filtered={filtered} locations={locations} supplies={supplies} contracts={contracts} onExport={handleExportPDF} />
        </TabsContent>

        <TabsContent value="lucro">
          <ProfitTab filtered={filtered} locations={locations} contracts={contracts} onContractsChange={fetchContracts} onExport={handleExportPDF} />
        </TabsContent>

        <TabsContent value="insumos-local">
          <SupplyConsumptionTab filtered={filtered} locations={locations} supplies={supplies} onExport={handleExportPDF} />
        </TabsContent>

        <TabsContent value="produtividade">
          <ProductivityTab filtered={filtered} employees={employees} onExport={handleExportPDF} />
        </TabsContent>

        <TabsContent value="ocorrencias">
          <OccurrencesTab filtered={filtered} locations={locations} onExport={handleExportPDF} />
        </TabsContent>

        <TabsContent value="manutencoes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Manutenções Realizadas</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExportPDF('Relatório de Manutenções')}>
                <FileText className="h-4 w-4 mr-1" /> Exportar PDF
              </Button>
            </CardHeader>
            <CardContent id="report-content">
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Data</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Serviços</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado no período</TableCell></TableRow>}
                    {filtered.map(m => (
                      <TableRow key={m.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedM(m)}>
                        <TableCell className="whitespace-nowrap font-medium">{m.date}</TableCell>
                        <TableCell>{getLocationName(m.locationId)}</TableCell>
                        <TableCell>{getEmployeeName(m.employeeId)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(m.checklist).filter(([,v]) => v).slice(0, 3).map(([k]) => (
                              <Badge key={k} variant="secondary" className="text-[10px] font-normal px-1.5 py-0 h-4">
                                {getChecklistLabel(k, m.templateId)}
                              </Badge>
                            ))}
                            {Object.entries(m.checklist).filter(([,v]) => v).length > 3 && <span className="text-[10px] self-center">...</span>}
                            {Object.entries(m.checklist).filter(([,v]) => v).length === 0 && '—'}
                          </div>
                        </TableCell>
                        <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parametros">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Parâmetros da Água</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExportPDF('Relatório de Parâmetros da Água')}>
                <FileText className="h-4 w-4 mr-1" /> Exportar PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader><TableRow className="bg-muted/30"><TableHead>Data</TableHead><TableHead>Local</TableHead><TableHead>pH</TableHead><TableHead>Cloro</TableHead><TableHead>Turbidez</TableHead><TableHead>Temp. °C</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="whitespace-nowrap font-medium">{m.date}</TableCell>
                        <TableCell>{getLocationName(m.locationId)}</TableCell>
                        <TableCell><span className={m.ph && (m.ph < 7 || m.ph > 7.4) ? 'text-destructive font-semibold' : ''}>{m.ph ?? '—'}</span></TableCell>
                        <TableCell><span className={m.chlorine && (m.chlorine < 1 || m.chlorine > 3) ? 'text-destructive font-semibold' : ''}>{m.chlorine ?? '—'}</span></TableCell>
                        <TableCell>{m.turbidity ?? '—'}</TableCell>
                        <TableCell>{m.temperature ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Maintenance Detail Dialog */}
      <Dialog open={!!selectedM} onOpenChange={open => !open && setSelectedM(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedM && (
            <>
              <DialogHeader>
                <div className="flex flex-col gap-1">
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    Manutenção Realizada
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {getLocationName(selectedM.locationId)}</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selectedM.date}</div>
                    <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {selectedM.startTime} - {selectedM.endTime}</div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-6 mt-6">
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full"><User className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Técnico Responsável</p>
                    <p className="font-medium">{getEmployeeName(selectedM.employeeId)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Beaker className="h-4 w-4" /> Parâmetros da Água</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'pH', value: selectedM.ph, unit: 'pH' },
                      { label: 'Cloro', value: selectedM.chlorine, unit: 'ppm' },
                      { label: 'Turbidez', value: selectedM.turbidity, unit: 'NTU' },
                      { label: 'Temperatura', value: selectedM.temperature, unit: '°C' },
                    ].map(p => (
                      <div key={p.label} className="p-3 border rounded-lg bg-card shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">{p.label}</p>
                        <p className="text-xl font-bold flex items-baseline gap-1">
                          {p.value ?? '—'} <span className="text-[10px] font-normal">{p.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Checklist de Serviços</h3>
                  <div className="grid gap-2 border rounded-lg p-3 bg-card shadow-sm">
                    {Object.entries(selectedM.checklist).map(([key, value]) => (
                      typeof value === 'boolean' ? (
                        <div key={key} className="flex items-center justify-between py-1.5 border-b border-muted last:border-0">
                          <span className="text-sm font-medium">{getChecklistLabel(key, selectedM.templateId)}</span>
                          {value ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Realizado</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Não Realizado</Badge>
                          )}
                        </div>
                      ) : (
                        <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-muted last:border-0">
                          <span className="text-xs text-muted-foreground">{getChecklistLabel(key, selectedM.templateId)}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      )
                    ))}
                    {Object.keys(selectedM.checklist).length === 0 && <p className="text-sm text-muted-foreground italic text-center">Nenhum item registrado</p>}
                  </div>
                </div>

                {selectedM.usedSupplies.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Droplets className="h-4 w-4" /> Insumos Lançados</h3>
                    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                      <Table>
                        <TableHeader><TableRow className="bg-muted/30"><TableHead className="h-8">Item</TableHead><TableHead className="h-8">Qtd.</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {selectedM.usedSupplies.map((us, i) => {
                            const s = supplies.find(sup => sup.id === us.supplyId);
                            return (
                              <TableRow key={i}>
                                <TableCell className="py-2 text-sm font-medium">{s?.name || 'Item Removido'}</TableCell>
                                <TableCell className="py-2 text-sm">{us.quantity} {s ? SUPPLY_UNIT_LABELS[s.unit] : ''}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {selectedM.photos.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Comprovação Visual</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedM.photos.map(p => (
                        <div key={p.id} className="relative group rounded-lg overflow-hidden border">
                          <img src={p.url} alt="Evidência" className="w-full h-40 object-cover" />
                          <div className="absolute bottom-1 right-1">
                            <Badge variant="secondary" className="text-[10px] py-0 h-4 uppercase">{p.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedM.notes && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold flex items-center gap-2"><FileText className="h-4 w-4" /> Observações do Técnico</h3>
                    <div className="p-4 bg-muted/20 border rounded-lg text-sm leading-relaxed italic">
                      "{selectedM.notes}"
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
