import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead, LEAD_ORIGIN_LABELS, LeadOrigin } from '@/types/leads';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface Props {
  leads: Lead[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function LeadsDashboard({ leads }: Props) {
  const total = leads.length;
  const won = leads.filter(l => l.status === 'fechado_ganho');
  const lost = leads.filter(l => l.status === 'perdido');
  const conversionRate = total > 0 ? ((won.length / total) * 100).toFixed(1) : '0';
  const totalProposals = leads.filter(l => l.proposalValue > 0).reduce((s, l) => s + l.proposalValue, 0);
  const totalWonValue = won.reduce((s, l) => s + l.proposalValue, 0);

  // By origin
  const byOrigin = Object.entries(LEAD_ORIGIN_LABELS).map(([key, label]) => ({
    name: label,
    value: leads.filter(l => l.origin === key).length,
  })).filter(d => d.value > 0);

  // By status for funnel
  const statusCounts = [
    { name: 'Novos', value: leads.filter(l => l.status === 'novo').length },
    { name: 'Contato', value: leads.filter(l => l.status === 'contato_iniciado').length },
    { name: 'Qualificado', value: leads.filter(l => l.status === 'qualificado').length },
    { name: 'Proposta', value: leads.filter(l => l.status === 'proposta_enviada').length },
    { name: 'Negociação', value: leads.filter(l => l.status === 'negociacao').length },
    { name: 'Ganhos', value: won.length },
    { name: 'Perdidos', value: lost.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Dashboard de Leads</span>
        <span className="text-xs font-normal text-primary bg-primary/5 px-2 py-0.5 rounded-full italic">oi</span>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total de Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900"><Target className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900"><DollarSign className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold">R$ {totalProposals.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-muted-foreground">Em Propostas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">R$ {totalWonValue.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-muted-foreground">Receita Fechada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Funil de Vendas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusCounts} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Origin */}
        <Card>
          <CardHeader><CardTitle className="text-base">Leads por Origem</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byOrigin} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {byOrigin.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
