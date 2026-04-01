import { useState, useMemo } from 'react';
import { useAppData } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, MapPin, User, Clock, Droplets, ChevronRight, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { SUPPLY_UNIT_LABELS, Maintenance } from '@/types';

export default function HistoryPage() {
  const { locations, employees, supplies, checklistTemplates, maintenances, deleteMaintenance } = useAppData();
  const { isAdmin } = useAuth();

  const [filterLocation, setFilterLocation] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [selected, setSelected] = useState<Maintenance | null>(null);

  const filtered = useMemo(() => {
    return maintenances.filter(m => {
      if (filterLocation !== 'all' && m.locationId !== filterLocation) return false;
      if (isAdmin && filterEmployee !== 'all' && m.employeeId !== filterEmployee) return false;
      if (filterFrom && m.date < filterFrom) return false;
      if (filterTo && m.date > filterTo) return false;
      return true;
    });
  }, [maintenances, filterLocation, filterEmployee, filterFrom, filterTo, isAdmin]);

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name ?? 'Local desconhecido';
  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name
      ?? employees.find(e => e.authUserId === id)?.name
      ?? 'Técnico desconhecido';
  };
  const getSupplyName = (id: string) => supplies.find(s => s.id === id)?.name ?? 'Item removido';
  const getSupplyUnit = (id: string) => { const s = supplies.find(s => s.id === id); return s ? SUPPLY_UNIT_LABELS[s.unit] : ''; };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    const error = await deleteMaintenance(id);
    if (error) {
      toast.error(`Erro ao excluir: ${error.message}`);
    } else {
      toast.success('Manutenção excluída');
      setSelected(null);
    }
  };
    const handleGenerateReport = (m: Maintenance) => {
    const template = checklistTemplates.find(t => t.id === m.templateId);
    const usedSup = (m.usedSupplies || []).filter(us => us.supplyId);
    const locationObj = locations.find(l => l.id === m.locationId);
    const employeeName = getEmployeeName(m.employeeId);
    const signatories = template?.signatories ?? [];

    const fmtDate = (d: string) => { const [y,mo,day] = d.split('-'); return `${day}/${mo}/${y}`; };
    const osNumber = Math.floor(Math.random() * 90000000) + 10000000;

    // Equipment rows — matches reference: Equipment | MARCA | QTDE. + vertical lines on right
    const equipmentRows = (template?.equipment ?? []).map(eq => `
      <tr>
        <td style="border:1px solid #999;padding:3px 6px">${eq.name}${eq.power ? ` (${eq.power})` : ''}</td>
        <td style="border:1px solid #999;padding:3px 6px;width:140px">${eq.brand || ''}</td>
        <td style="border:1px solid #999;padding:3px 6px;width:60px;text-align:center">${eq.quantity}</td>
        <td style="border:1px solid #999;padding:3px 6px;width:40px">&nbsp;</td>
      </tr>`).join('');

    // Checklist rows — item | OK or blank line
    const checklistRows = (template?.questions ?? []).map(q => {
      const answer = m.checklist[q.id];
      let status = '&nbsp;';
      if (answer !== undefined && answer !== '') {
        status = q.type === 'boolean'
          ? (answer ? 'Ok' : 'Não')
          : String(answer);
      }
      return `<tr>
        <td style="border:1px solid #999;padding:3px 6px">${q.text}</td>
        <td style="border:1px solid #999;padding:3px 6px;width:60px;text-align:center">${status}</td>
      </tr>`;
    }).join('');

    // Supplies rows
    const suppliesRows = usedSup.map(us => {
      const s = supplies.find(sup => sup.id === us.supplyId);
      return `<tr>
        <td style="border:1px solid #999;padding:3px 6px">${s?.name || 'Item removido'}</td>
        <td style="border:1px solid #999;padding:3px 6px;width:120px;text-align:center">${us.quantity} ${s ? SUPPLY_UNIT_LABELS[s.unit] : ''}</td>
      </tr>`;
    }).join('');

    // Photos
    const photosRows = (template?.includePhotos !== false && m.photos && m.photos.length > 0)
      ? m.photos.map(p => `<div style="break-inside:avoid">
          <img src="${p.url}" style="width:100%;height:160px;object-fit:cover;border:1px solid #ccc;display:block" />
          <div style="font-size:8px;text-align:center;text-transform:uppercase;color:#555;margin-top:2px">${p.type}</div>
        </div>`).join('')
      : '';

    // Signatures
    const sigRows = signatories.length > 0
      ? signatories.map(sig => `
        <div style="flex:1;min-width:160px">
          <div style="border-bottom:1px solid #333;height:44px;margin-bottom:4px"></div>
          <div style="font-size:9px;font-weight:bold">${sig.label || 'Responsável'}</div>
          ${sig.name ? `<div style="font-size:9px;color:#444">${sig.name}</div>` : ''}
          ${sig.document ? `<div style="font-size:9px;color:#666">${sig.document}</div>` : ''}
        </div>`).join('')
      : `<div style="flex:1">
          <div style="border-bottom:1px solid #333;height:44px;margin-bottom:4px"></div>
          <div style="font-size:9px;font-weight:bold">Responsável pelo setor</div>
        </div>`;

    const fullAddress = locationObj?.address
      ? locationObj.address + (locationObj.city ? ', ' + locationObj.city : '')
      : (template?.address || '');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Ordem de Serviço - ${m.date}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#111;padding:20px;max-width:820px;margin:0 auto;background:#fff}
  table{border-collapse:collapse;width:100%}
  .gray-bar{background:#c0c0c0;font-weight:bold;text-align:center;padding:3px 6px;font-size:10px;border:1px solid #999}
  .section-gap{height:6px}
  @media print{body{padding:10px}}
</style>
</head>
<body>

<!-- ===== COMPANY HEADER ===== -->
<table style="margin-bottom:10px">
  <tr>
    <td style="width:110px;padding-right:16px;text-align:center;vertical-align:middle">
      <!-- SSD Logo -->
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjAgMTIwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEyMCI+CiAgPCEtLSBPdXRlciBib3JkZXIgLS0+CiAgPHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjIxOCIgaGVpZ2h0PSIxMTgiIHJ4PSIyIiByeT0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMmQ0ZTgyIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8IS0tIEJsdWUgYmFja2dyb3VuZCAtLT4KICA8cmVjdCB4PSI4IiB5PSI4IiB3aWR0aD0iMjA0IiBoZWlnaHQ9IjEwNCIgcng9IjMiIHJ5PSIzIiBmaWxsPSIjMmQ0ZTgyIi8+CgogIDwhLS0gTGV0dGVyIFMgKGxlZnQpIC0tPgogIDxnIGZpbGw9IndoaXRlIj4KICAgIDwhLS0gVG9wIGJhciBvZiBmaXJzdCBTIC0tPgogICAgPHBhdGggZD0iTTE4IDIyIFExOCAxNiAyNCAxNiBMNzIgMTYgUTgwIDE2IDgwIDI0IFE4MCAzMCA3NCAzMCBMMzAgMzAgUTI2IDMwIDI2IDM0IEwyNiA0NiBRMjYgNTAgMzAgNTAgTDc2IDUwIFE4NCA1MCA4NCA1OCBMODQgNzQgUTg0IDgyIDc2IDgyIEwyNCA4MiBRMTYgODIgMTYgNzQgUTE2IDY4IDIyIDY4IEw3MCA2OCBRNzQgNjggNzQgNjQgTDc0IDUyIFE3NCA0OCA3MCA0OCBMMjQgNDggUTE2IDQ4IDE2IDQwIEwxNiAyOCBRMTYgMjIgMTggMjJaIi8+CiAgPC9nPgoKICA8IS0tIExldHRlciBTIChtaWRkbGUpIC0tPgogIDxnIGZpbGw9IndoaXRlIj4KICAgIDxwYXRoIGQ9Ik05NCAyMiBROTQgMTYgMTAwIDE2IEwxNDggMTYgUTE1NiAxNiAxNTYgMjQgUTE1NiAzMCAxNTAgMzAgTDEwNiAzMCBRMTAyIDMwIDEwMiAzNCBMMTAyIDQ2IFExMDIgNTAgMTA2IDUwIEwxNTIgNTAgUTE2MCA1MCAxNjAgNTggTDE2MCA3NCBRMTYwIDgyIDE1MiA4MiBMMTAwIDgyIFE5MiA4MiA5MiA3NCBROTIgNjggOTggNjggTDE0NiA2OCBRMTUwIDY4IDE1MCA2NCBMMTUwIDUyIFExNTAgNDggMTQ2IDQ4IEwxMDAgNDggUTkyIDQ4IDkyIDQwIEw5MiAyOCBROTIgMjIgOTQgMjJaIi8+CiAgPC9nPgoKICA8IS0tIExldHRlciBEIChyaWdodCkgLS0+CiAgPGcgZmlsbD0id2hpdGUiPgogICAgPHBhdGggZD0iTTE2OCAxNiBMMTk2IDE2IFEyMTQgMTYgMjE0IDM0IEwyMTQgNjQgUTIxNCA4MiAxOTYgODIgTDE2OCA4MiBRMTY4IDgyIDE2OCAxNlogTTE3OCAyOCBMMTc4IDcwIEwxOTQgNzAgUTIwMiA3MCAyMDIgNjIgTDIwMiAzNiBRMjAyIDI4IDE5NCAyOFoiLz4KICA8L2c+CgogIDwhLS0gTGlnaHQgcmVmbGVjdGlvbiBzdHJpcGVzIG9uIGxldHRlcnMgLS0+CiAgPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iNjgiIGhlaWdodD0iOCIgcng9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xOCkiLz4KICA8cmVjdCB4PSI5MiIgeT0iMTYiIHdpZHRoPSI2OCIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE4KSIvPgogIDxyZWN0IHg9IjE2OCIgeT0iMTYiIHdpZHRoPSI0NiIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE4KSIvPgo8L3N2Zz4K" 
           alt="SSD Logo" style="width:100px;height:auto;display:block;margin:0 auto" />
    </td>
    <td style="vertical-align:top;padding-top:4px">
      <div style="font-size:18px;font-weight:bold;color:#1a1a1a;letter-spacing:1px">ORDEM DE SERVIÇO</div>
      <div style="font-size:12px;font-weight:bold;margin:4px 0">SSD Comércio e Serviços</div>
      <div style="font-size:10px;line-height:1.7;color:#333">
        <strong>Telefone:</strong>(11) 9400-41020<br>
        <strong>CNPJ:</strong>${locationObj?.cnpj || '02.667.452/0001-57'}<br>
        <strong>Email:</strong>contato@ssdservicos.com.br
      </div>
    </td>
  </tr>
</table>

<!-- ===== OS NUMBER BAR ===== -->
<table style="margin-bottom:4px;border:1px solid #999">
  <tr>
    <td style="padding:4px 8px;font-weight:bold;font-size:10px">${locationObj?.name || getLocationName(m.locationId)}</td>
    <td style="padding:4px 8px;text-align:right;font-weight:bold;font-size:10px;white-space:nowrap">N d os ${osNumber}</td>
  </tr>
</table>

<!-- ===== CLIENT INFO ===== -->
<div class="gray-bar">Informações do cliente</div>
<table style="border:1px solid #999;border-top:none;margin-bottom:4px">
  <tr>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold;width:100px">CPF/CNPJ</td>
    <td style="border:1px solid #999;padding:3px 6px">${locationObj?.cnpj || ''}</td>
  </tr>
</table>

<!-- ===== ACTIVITY INFO ===== -->
<div class="gray-bar">Informações da atividade</div>
<table style="border:1px solid #999;border-top:none;margin-bottom:4px">
  <tr>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold;width:110px">Para</td>
    <td style="border:1px solid #999;padding:3px 6px">${employeeName}</td>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold;width:100px">Tipo tarefa</td>
    <td style="border:1px solid #999;padding:3px 6px">Manutenção Preventiva</td>
  </tr>
  <tr>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold">Data</td>
    <td style="border:1px solid #999;padding:3px 6px">${fmtDate(m.date)}</td>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold">Check-In</td>
    <td style="border:1px solid #999;padding:3px 6px">${m.startTime ? fmtDate(m.date) + ' às ' + m.startTime : '—'}</td>
  </tr>
  <tr>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold">Check-Out</td>
    <td style="border:1px solid #999;padding:3px 6px">${m.endTime ? fmtDate(m.date) + ' às ' + m.endTime : '—'}</td>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold">Finalizada</td>
    <td style="border:1px solid #999;padding:3px 6px">Finalizada manualmente</td>
  </tr>
  <tr>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold">Endereço</td>
    <td colspan="3" style="border:1px solid #999;padding:3px 6px">${fullAddress || '—'}</td>
  </tr>
  ${locationObj?.responsible ? `<tr>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold">Responsável</td>
    <td colspan="3" style="border:1px solid #999;padding:3px 6px">${locationObj.responsible}</td>
  </tr>` : ''}
  <tr>
    <td style="border:1px solid #999;padding:3px 6px;font-weight:bold">Relato de execução</td>
    <td colspan="3" style="border:1px solid #999;padding:3px 6px">${m.notes || 'Manutenção preventiva'}</td>
  </tr>
</table>

<div class="section-gap"></div>

<!-- ===== CHECKLIST SECTION ===== -->
${template ? `
<div class="gray-bar">Questionário: ${template.title}</div>
<div style="border:1px solid #999;border-top:none;padding:8px 8px 4px;margin-bottom:4px">
  ${template.processNumber ? `<div style="font-style:italic;font-weight:bold;font-size:10px">Relatório de manutenção - processo ${template.processNumber}</div>` : ''}
  ${template.companyName ? `<div style="font-weight:bold;font-size:10px;margin-top:4px">${template.companyName}</div>` : ''}
  <div style="margin-top:6px;font-size:10px;line-height:2">
    <div>Data: <span style="border-bottom:1px solid #999;display:inline-block;width:120px">${fmtDate(m.date)}</span></div>
    ${template.locationName ? `<div>Local: ${template.locationName}</div>` : ''}
    ${fullAddress ? `<div>Endereço: ${fullAddress}</div>` : ''}
    <div>Funcionário responsável: ${employeeName}</div>
  </div>
</div>` : ''}

<!-- ===== EQUIPMENT ===== -->
${equipmentRows ? `
<table style="margin-bottom:4px;border:1px solid #999">
  <thead>
    <tr style="background:#ddd">
      <th style="border:1px solid #999;padding:3px 6px;text-align:left">EQUIPAMENTOS</th>
      <th style="border:1px solid #999;padding:3px 6px;width:140px">MARCA</th>
      <th style="border:1px solid #999;padding:3px 6px;width:60px;text-align:center">QTDE.</th>
      <th style="border:1px solid #999;padding:3px 6px;width:40px">&nbsp;</th>
    </tr>
  </thead>
  <tbody>${equipmentRows}</tbody>
</table>` : ''}

<!-- ===== CHECKLIST QUESTIONS ===== -->
${checklistRows ? `
<table style="margin-bottom:4px;border:1px solid #999">
  <thead>
    <tr style="background:#ddd">
      <th style="border:1px solid #999;padding:3px 6px;text-align:left">Portas e Portões</th>
      <th style="border:1px solid #999;padding:3px 6px;width:60px;text-align:center">Status</th>
    </tr>
  </thead>
  <tbody>${checklistRows}</tbody>
</table>` : ''}

<!-- ===== WATER PARAMS ===== -->
${(m.ph !== null || m.chlorine !== null || m.turbidity !== null || m.temperature !== null) ? `
<table style="margin-bottom:4px;border:1px solid #999">
  <thead>
    <tr style="background:#ddd">
      <th style="border:1px solid #999;padding:3px 6px">pH</th>
      <th style="border:1px solid #999;padding:3px 6px">Cloro (ppm)</th>
      <th style="border:1px solid #999;padding:3px 6px">Turbidez (NTU)</th>
      <th style="border:1px solid #999;padding:3px 6px">Temperatura (°C)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #999;padding:5px 6px;font-weight:bold;text-align:center">${m.ph ?? '—'}</td>
      <td style="border:1px solid #999;padding:5px 6px;font-weight:bold;text-align:center">${m.chlorine ?? '—'}</td>
      <td style="border:1px solid #999;padding:5px 6px;font-weight:bold;text-align:center">${m.turbidity ?? '—'}</td>
      <td style="border:1px solid #999;padding:5px 6px;font-weight:bold;text-align:center">${m.temperature ?? '—'}</td>
    </tr>
  </tbody>
</table>` : ''}

<!-- ===== SUPPLIES ===== -->
${suppliesRows ? `
<div class="gray-bar" style="margin-top:4px">Insumos Utilizados</div>
<table style="border:1px solid #999;border-top:none;margin-bottom:4px">
  <thead>
    <tr style="background:#ddd">
      <th style="border:1px solid #999;padding:3px 6px;text-align:left">Produto</th>
      <th style="border:1px solid #999;padding:3px 6px;width:120px;text-align:center">Quantidade</th>
    </tr>
  </thead>
  <tbody>${suppliesRows}</tbody>
</table>` : ''}

<!-- ===== OBS ===== -->
<div style="margin-bottom:4px">
  <div style="font-weight:bold;padding:2px 0">Obs:</div>
  <div style="border-bottom:1px solid #999;height:18px;margin-bottom:4px"></div>
  <div style="border-bottom:1px solid #999;height:18px"></div>
</div>

<!-- ===== PHOTOS ===== -->
${photosRows ? `
<div class="gray-bar" style="margin-top:8px">Fotos</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px;border:1px solid #999;border-top:none;margin-bottom:8px">
  ${photosRows}
</div>` : ''}

<!-- ===== SIGNATURES ===== -->
<div style="margin-top:16px">
  <div style="display:flex;gap:30px;flex-wrap:wrap">
    ${sigRows}
  </div>
</div>

<div style="margin-top:14px;text-align:center;font-size:8px;color:#aaa;border-top:1px solid #eee;padding-top:6px">
  Relatório gerado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} — Sistema SSD
</div>

</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };



  // ── Detail Dialog ────────────────────────────────────────────────────────
  const DetailDialog = () => {
    if (!selected) return null;
    const m = selected;
    const template = checklistTemplates.find(t => t.id === m.templateId);
    const usedSup = (m.usedSupplies || []).filter(us => us.supplyId);

    return (
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{getLocationName(m.locationId)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Técnico</p>
                <p className="font-semibold mt-0.5">{getEmployeeName(m.employeeId)}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Data</p>
                <p className="font-semibold mt-0.5">{formatDate(m.date)}</p>
              </div>
              {m.startTime && (
                <div className="bg-muted/30 rounded-lg p-3 col-span-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Horário</p>
                  <p className="font-semibold mt-0.5">{m.startTime}{m.endTime && ` – ${m.endTime}`}</p>
                </div>
              )}
            </div>

            {/* Water params */}
            {(m.ph !== null || m.chlorine !== null || m.turbidity !== null || m.temperature !== null) && (
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Parâmetros da Água</p>
                <div className="flex flex-wrap gap-2">
                  {m.ph !== null && <div className="px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-lg text-sky-800 text-center"><p className="text-[9px] font-bold uppercase opacity-70">pH</p><p className="font-bold">{m.ph}</p></div>}
                  {m.chlorine !== null && <div className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-center"><p className="text-[9px] font-bold uppercase opacity-70">Cloro</p><p className="font-bold">{m.chlorine} <span className="text-[9px] font-normal">ppm</span></p></div>}
                  {m.turbidity !== null && <div className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 text-center"><p className="text-[9px] font-bold uppercase opacity-70">Turbidez</p><p className="font-bold">{m.turbidity} <span className="text-[9px] font-normal">NTU</span></p></div>}
                  {m.temperature !== null && <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-center"><p className="text-[9px] font-bold uppercase opacity-70">Temp.</p><p className="font-bold">{m.temperature}°C</p></div>}
                </div>
              </div>
            )}

            {/* Checklist summary */}
            {template && (
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">{template.title}</p>
                {template.questions && template.questions.some(q => m.checklist[q.id] !== undefined && m.checklist[q.id] !== '') && (
                  <ul className="space-y-1.5">
                    {template.questions.map(q => {
                      const answer = m.checklist[q.id];
                      if (answer === undefined || answer === '') return null;
                      const display = q.type === 'boolean' ? (answer ? 'Sim' : 'Não') : String(answer);
                      return (
                        <li key={q.id} className="flex items-center justify-between border-b border-muted/30 pb-1">
                          <span className="text-muted-foreground text-xs">{q.text}</span>
                          <Badge variant="secondary" className={q.type === 'boolean' && answer ? 'bg-green-50 text-green-700 border-green-100' : ''}>{display}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Supplies */}
            {usedSup.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Insumos Utilizados</p>
                <div className="flex flex-wrap gap-1.5">
                  {usedSup.map((us, i) => (
                    <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-100 font-normal">
                      {getSupplyName(us.supplyId)} — {us.quantity} {getSupplyUnit(us.supplyId)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {m.photos && m.photos.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Fotos ({m.photos.length})</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {m.photos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img src={photo.url} alt={photo.type} className="w-full h-20 object-cover rounded-lg border border-muted/40" />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1 rounded uppercase font-bold">{photo.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {m.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-[10px] uppercase font-bold text-amber-700 mb-1">Observações</p>
                <p className="text-xs text-amber-900 italic">"{m.notes}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button onClick={() => handleGenerateReport(m)} className="flex-1 gap-2" variant="outline">
                <FileText className="h-4 w-4" /> Gerar Relatório
              </Button>
              {isAdmin && (
                <Button onClick={() => handleDelete(m.id)} variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Histórico de Manutenções</h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-muted/20 rounded-xl border border-muted/40">
        <div>
          <Label className="text-xs text-muted-foreground">Local</Label>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="field-touch mt-1 bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {isAdmin && (
          <div>
            <Label className="text-xs text-muted-foreground">Funcionário</Label>
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="field-touch mt-1 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label className="text-xs text-muted-foreground">De</Label>
          <Input type="date" className="field-touch mt-1 bg-background" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Até</Label>
          <Input type="date" className="field-touch mt-1 bg-background" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl text-muted-foreground">
          <Droplets className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Nenhuma manutenção encontrada</p>
          <p className="text-sm mt-1">{maintenances.length === 0 ? 'Nenhum registro ainda.' : 'Tente ajustar os filtros.'}</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => {
          const hasPhotos = m.photos && m.photos.length > 0;
          const hasParams = m.ph !== null || m.chlorine !== null;
          const hasSupplies = m.usedSupplies && m.usedSupplies.length > 0;

          return (
            <Card
              key={m.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group relative"
              onClick={() => setSelected(m)}
            >
              <CardContent className="p-4">
                {/* Location */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="font-bold text-sm leading-tight truncate text-foreground">
                      {getLocationName(m.locationId)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0 mt-0.5" />
                </div>

                {/* Employee */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{getEmployeeName(m.employeeId)}</span>
                </div>

                {/* Date + Time */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{formatDate(m.date)}</span>
                  {m.startTime && (
                    <span className="text-muted-foreground/60">
                      • {m.startTime}{m.endTime && ` – ${m.endTime}`}
                    </span>
                  )}
                </div>

                {/* Quick badges */}
                {(hasParams || hasPhotos || hasSupplies) && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {hasParams && (
                      <span className="text-[10px] bg-sky-50 text-sky-600 border border-sky-100 rounded px-1.5 py-0.5 font-medium">
                        pH {m.ph ?? '—'}
                      </span>
                    )}
                    {hasPhotos && (
                      <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 rounded px-1.5 py-0.5 font-medium flex items-center gap-1">
                        <Camera className="h-2.5 w-2.5" />{m.photos.length} fotos
                      </span>
                    )}
                    {hasSupplies && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 font-medium">
                        {m.usedSupplies.length} insumo{m.usedSupplies.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DetailDialog />
    </div>
  );
}
