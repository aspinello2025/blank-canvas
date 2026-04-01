import { useState } from 'react';
import { useAppData } from '@/context/AppContext';
import { Plus, FileText, Settings, HelpCircle, Eye, Trash2, ArrowLeft, Save, GripVertical, Camera, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ChecklistTemplate, ChecklistSignatory, EquipmentItem, ChecklistQuestion, QuestionType } from '@/types';

const DEFAULT_EQUIPMENT: Omit<EquipmentItem, 'id'>[] = [
  { name: 'Painel elétrico', power: '60a', brand: '', quantity: 1 },
  { name: 'Painel elétrico', power: '40a', brand: '', quantity: 1 },
  { name: 'Bomba de recalque', power: '0,5 cv', brand: 'Jacuzzi', quantity: 2 },
  { name: 'Bomba de piscina', power: '2,0 cv', brand: 'Dancor', quantity: 1 },
];

// ─── Preview Dialog ──────────────────────────────────────────────────────────

function ChecklistPreviewDialog({ template, open, onClose }: { template: ChecklistTemplate; open: boolean; onClose: () => void }) {
  const signatories = template.signatories ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Pré-visualização do Relatório
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm font-sans">
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-4">
            <h3 className="font-bold text-base">{template.title}</h3>
            {template.processNumber && (
              <p className="text-xs text-muted-foreground">Processo: {template.processNumber}</p>
            )}
            {template.companyName && (
              <p className="text-xs font-semibold">{template.companyName}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-left bg-muted/30 p-3 rounded-lg text-xs mt-3">
              {template.locationName && (
                <div><span className="font-semibold block">Local:</span>{template.locationName}</div>
              )}
              <div><span className="font-semibold block">Data:</span>{new Date().toLocaleDateString('pt-BR')}</div>
              {template.address && (
                <div className="col-span-2"><span className="font-semibold block">Endereço:</span>{template.address}</div>
              )}
              <div className="col-span-2"><span className="font-semibold block">Funcionário:</span><span className="text-muted-foreground italic">__(será preenchido)__</span></div>
            </div>
          </div>

          {/* Equipment */}
          {template.equipment && template.equipment.length > 0 && (
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-primary/70 mb-2">Equipamentos Inspecionados</h4>
              <div className="rounded border overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-1.5 font-semibold">Equipamento</th>
                      <th className="text-left px-3 py-1.5 font-semibold">Pot.</th>
                      <th className="text-left px-3 py-1.5 font-semibold">Marca</th>
                      <th className="text-center px-2 py-1.5 font-semibold">Qtde</th>
                      <th className="text-center px-2 py-1.5 font-semibold">OK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.equipment.map((eq, i) => (
                      <tr key={eq.id || i} className="border-t">
                        <td className="px-3 py-1.5">{eq.name}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{eq.power}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{eq.brand}</td>
                        <td className="px-2 py-1.5 text-center">{eq.quantity}</td>
                        <td className="px-2 py-1.5 text-center">
                          <div className="h-3.5 w-3.5 border border-muted-foreground/50 rounded-sm mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Checklist */}
          {template.questions && template.questions.length > 0 && (
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-primary/70 mb-3">Checklist de Inspeção</h4>
              <div className="space-y-3">
                {template.questions.map((q, i) => (
                  <div key={q.id} className="flex flex-col gap-1 border-l-2 border-primary/15 pl-3">
                    <Label className="text-xs font-medium">
                      {i + 1}. {q.text || 'Pergunta sem texto'}
                      {q.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {q.type === 'boolean' && (
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-8 rounded-full border border-muted-foreground/40 bg-muted/20" />
                        <span className="text-[10px] text-muted-foreground">Sim / Não</span>
                      </div>
                    )}
                    {q.type === 'text' && <div className="border-b border-dashed border-muted-foreground/30 w-full h-4" />}
                    {q.type === 'number' && <div className="border border-muted-foreground/30 rounded w-20 h-5" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="pt-2 border-t">
            <Label className="text-xs font-semibold block mb-1">OBS:</Label>
            <div className="space-y-1.5">
              <div className="border-b border-muted-foreground/30 w-full h-4" />
              <div className="border-b border-muted-foreground/30 w-full h-4" />
            </div>
          </div>

          {/* Photos section */}
          {template.includePhotos && (
            <div className="border-t pt-3">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-primary/70 mb-2 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                Fotos
              </h4>
              <div className="grid grid-cols-3 gap-1.5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-muted/30 rounded border border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 italic">Fotos serão inseridas automaticamente a partir do registro de manutenção.</p>
            </div>
          )}

          {/* Signatories */}
          {signatories.length > 0 && (
            <div className="border-t pt-3 space-y-4">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-primary/70 flex items-center gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                Assinaturas
              </h4>
              {signatories.map(sig => (
                <div key={sig.id} className="space-y-1">
                  <div className="border-b border-foreground/30 w-full pb-6" />
                  <p className="text-[11px] font-semibold">
                    {sig.label || 'Responsável'}
                    {sig.name && <span className="font-normal text-muted-foreground"> — {sig.name}</span>}
                  </p>
                  {sig.document && (
                    <p className="text-[10px] text-muted-foreground">{sig.document}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Default signature if none added */}
          {signatories.length === 0 && (
            <div className="border-t pt-3 space-y-1">
              <div className="border-b border-foreground/30 w-full pb-6" />
              <p className="text-[11px] font-semibold">Responsável pelo setor</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Builder Form ─────────────────────────────────────────────────────────────

function ChecklistBuilderForm({ onDone }: { onDone: () => void }) {
  const { addChecklistTemplate } = useAppData();

  const [title, setTitle] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [companyName, setCompanyName] = useState('SSD COMÉRCIO E SERVIÇOS LTDA - EPP');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [includePhotos, setIncludePhotos] = useState(true);

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(
    DEFAULT_EQUIPMENT.map((eq, i) => ({ ...eq, id: `eq-${i}` }))
  );
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [signatories, setSignatories] = useState<ChecklistSignatory[]>([
    { id: `sig-${Date.now()}`, label: 'Responsável pelo setor', name: '', document: '' }
  ]);

  // Equipment handlers
  const addEquipment = () =>
    setEquipmentList(prev => [...prev, { id: `eq-${Date.now()}`, name: '', power: '', brand: '', quantity: 1 }]);
  const updateEquipment = (id: string, field: keyof EquipmentItem, value: string | number) =>
    setEquipmentList(prev => prev.map(eq => eq.id === id ? { ...eq, [field]: value } : eq));
  const removeEquipment = (id: string) =>
    setEquipmentList(prev => prev.filter(eq => eq.id !== id));

  // Question handlers
  const addQuestion = () =>
    setQuestions(prev => [...prev, { id: `q-${Date.now()}`, text: '', type: 'boolean', required: true }]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateQuestion = (id: string, field: keyof ChecklistQuestion, value: any) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  const removeQuestion = (id: string) =>
    setQuestions(prev => prev.filter(q => q.id !== id));

  // Signatory handlers
  const addSignatory = () =>
    setSignatories(prev => [...prev, { id: `sig-${Date.now()}`, label: '', name: '', document: '' }]);
  const updateSignatory = (id: string, field: keyof ChecklistSignatory, value: string) =>
    setSignatories(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  const removeSignatory = (id: string) =>
    setSignatories(prev => prev.filter(s => s.id !== id));

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('O título do questionário é obrigatório');
      return;
    }
    const template: Omit<ChecklistTemplate, 'id'> = {
      title,
      processNumber,
      companyName,
      locationName,
      address,
      responsibleEmployee: '',
      equipment: equipmentList,
      questions,
      includePhotos,
      signatories,
    };
    addChecklistTemplate(template);
    toast.success('Modelo de checklist salvo com sucesso!');
    onDone();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onDone}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Novo Modelo de Checklist</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Configure o formato do relatório de manutenção</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Modelo
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* ── Left Column ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Header Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                Cabeçalho do Relatório
              </CardTitle>
              <CardDescription>Informações fixas que aparecem no topo do relatório.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do questionário *</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Checklist Piscina Municipal" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="process">Processo</Label>
                  <Input id="process" value={processNumber} onChange={e => setProcessNumber(e.target.value)} placeholder="Ex: 300.262/2022" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input id="location" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Nome do local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço completo" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-5 w-5 text-primary" />
                  Equipamentos
                </CardTitle>
                <CardDescription className="mt-1">Bombas, painéis e outros equipamentos do local.</CardDescription>
              </div>
              <Button onClick={addEquipment} variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Potência</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead className="w-[90px]">Qtde.</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentList.map(eq => (
                      <TableRow key={eq.id}>
                        <TableCell><Input value={eq.name} onChange={e => updateEquipment(eq.id, 'name', e.target.value)} placeholder="Nome" className="h-8" /></TableCell>
                        <TableCell><Input value={eq.power} onChange={e => updateEquipment(eq.id, 'power', e.target.value)} placeholder="Ex: 2,0 cv" className="h-8" /></TableCell>
                        <TableCell><Input value={eq.brand} onChange={e => updateEquipment(eq.id, 'brand', e.target.value)} placeholder="Marca" className="h-8" /></TableCell>
                        <TableCell><Input type="number" min="1" value={eq.quantity} onChange={e => updateEquipment(eq.id, 'quantity', parseInt(e.target.value) || 1)} className="h-8" /></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeEquipment(eq.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {equipmentList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-5 text-muted-foreground text-sm">
                          Nenhum equipamento. Pressione "Adicionar".
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Perguntas do Checklist
                </CardTitle>
                <CardDescription className="mt-1">Itens que o funcionário preencherá durante a manutenção.</CardDescription>
              </div>
              <Button onClick={addQuestion} variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions.map((q, index) => (
                <div key={q.id} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/20">
                  <div className="pt-2 cursor-move text-muted-foreground/40">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-xs">Pergunta {index + 1}</Label>
                        <Input value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} placeholder="Ex: A bomba apresenta vazamento?" />
                      </div>
                      <div className="sm:w-44 space-y-1.5">
                        <Label className="text-xs">Tipo</Label>
                        <Select value={q.type} onValueChange={val => updateQuestion(q.id, 'type', val as QuestionType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boolean">Sim / Não</SelectItem>
                            <SelectItem value="text">Texto Livre</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch id={`req-${q.id}`} checked={q.required} onCheckedChange={checked => updateQuestion(q.id, 'required', checked)} />
                        <Label htmlFor={`req-${q.id}`} className="cursor-pointer font-normal text-muted-foreground text-xs">Obrigatória</Label>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-7 text-xs" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/10">
                  <HelpCircle className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Nenhuma pergunta adicionada ainda.</p>
                  <Button onClick={addQuestion} variant="link" className="mt-1 text-primary text-sm">
                    Adicionar a primeira pergunta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos section toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-5 w-5 text-primary" />
                Seção de Fotos
              </CardTitle>
              <CardDescription>Define se o relatório terá uma seção de fotos com as imagens da manutenção.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div>
                  <p className="font-medium text-sm">Incluir seção de fotos no relatório</p>
                  <p className="text-xs text-muted-foreground mt-0.5">As fotos registradas durante a manutenção serão exibidas no relatório gerado.</p>
                </div>
                <Switch checked={includePhotos} onCheckedChange={setIncludePhotos} />
              </div>
              {includePhotos && (
                <div className="mt-3 grid grid-cols-4 gap-2 opacity-40 pointer-events-none">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square bg-muted rounded border border-dashed flex items-center justify-center">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signatories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PenLine className="h-5 w-5 text-primary" />
                  Rodapé — Assinaturas
                </CardTitle>
                <CardDescription className="mt-1">
                  Defina quem deve assinar o relatório. Cada campo gera uma linha de assinatura com nome e documento.
                </CardDescription>
              </div>
              <Button onClick={addSignatory} variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {signatories.map((sig, i) => (
                <div key={sig.id} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/20">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Cargo / Título</Label>
                      <Input
                        value={sig.label}
                        onChange={e => updateSignatory(sig.id, 'label', e.target.value)}
                        placeholder="Ex: Responsável pelo setor"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome (opcional)</Label>
                      <Input
                        value={sig.name}
                        onChange={e => updateSignatory(sig.id, 'name', e.target.value)}
                        placeholder="Nome do signatário"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Documento (CPF, CREA...)</Label>
                      <Input
                        value={sig.document}
                        onChange={e => updateSignatory(sig.id, 'document', e.target.value)}
                        placeholder="Ex: CPF: 000.000.000-00"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive/70 hover:bg-destructive/10 hover:text-destructive mt-5 shrink-0"
                    onClick={() => removeSignatory(sig.id)}
                    disabled={signatories.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {signatories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 italic">
                  Adicione pelo menos um signatário para o rodapé do relatório.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Live Preview ── */}
        <div className="lg:col-span-4">
          <Card className="sticky top-6">
            <CardHeader className="bg-primary/5 border-b py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Pré-visualização
              </CardTitle>
              <CardDescription className="text-xs">Como ficará o relatório</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-4 max-h-[72vh] overflow-y-auto text-xs">
                {/* Header preview */}
                <div className="text-center space-y-0.5">
                  <p className="font-bold text-sm">{title || 'Título do questionário'}</p>
                  <p className="text-muted-foreground text-[10px]">Processo: {processNumber || '—'}</p>
                  <p className="font-semibold text-[10px]">{companyName}</p>
                  <div className="grid grid-cols-2 gap-1.5 text-left bg-muted/20 p-2 rounded text-[10px] mt-1.5">
                    <div><span className="font-semibold">Local:</span><br />{locationName || '—'}</div>
                    <div><span className="font-semibold">Data:</span><br />{new Date().toLocaleDateString('pt-BR')}</div>
                    <div className="col-span-2"><span className="font-semibold">End.:</span><br />{address || '—'}</div>
                  </div>
                </div>

                {/* Equipment preview */}
                {equipmentList.length > 0 && (
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-wide border-b pb-1 mb-1.5">Equipamentos</p>
                    <ul className="space-y-0.5">
                      {equipmentList.slice(0, 4).map(eq => (
                        <li key={eq.id} className="flex justify-between text-[10px]">
                          <span>{eq.quantity}x {eq.name}</span>
                          <span className="text-muted-foreground">{eq.power}</span>
                        </li>
                      ))}
                      {equipmentList.length > 4 && (
                        <li className="text-muted-foreground italic text-[10px]">+{equipmentList.length - 4} outros...</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Questions preview */}
                {questions.length > 0 && (
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-wide border-b pb-1 mb-1.5">Checklist</p>
                    <div className="space-y-1.5">
                      {questions.map((q, i) => (
                        <div key={q.id} className="text-[10px]">
                          <p className="font-medium">{i + 1}. {q.text || 'Sem texto'} {q.required && <span className="text-destructive">*</span>}</p>
                          {q.type === 'boolean' && <div className="h-3 w-6 rounded-full border border-muted-foreground/30 bg-muted/20 mt-0.5" />}
                          {q.type === 'text' && <div className="border-b border-dashed border-muted-foreground/25 mt-0.5" />}
                          {q.type === 'number' && <div className="border border-muted-foreground/25 rounded w-12 h-3.5 mt-0.5" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OBS */}
                <div className="border-t pt-2">
                  <p className="font-semibold text-[10px] mb-1">OBS:</p>
                  <div className="space-y-1">
                    <div className="border-b border-muted-foreground/20 h-3" />
                    <div className="border-b border-muted-foreground/20 h-3" />
                  </div>
                </div>

                {/* Photos preview */}
                {includePhotos && (
                  <div className="border-t pt-2">
                    <p className="font-bold text-[10px] uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Camera className="h-3 w-3" /> Fotos
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="aspect-square bg-muted/30 rounded border border-dashed border-muted-foreground/25 flex items-center justify-center">
                          <Camera className="h-3 w-3 text-muted-foreground/30" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatories preview */}
                {signatories.length > 0 && (
                  <div className="border-t pt-2 space-y-3">
                    <p className="font-bold text-[10px] uppercase tracking-wide flex items-center gap-1">
                      <PenLine className="h-3 w-3" /> Assinaturas
                    </p>
                    {signatories.map(sig => (
                      <div key={sig.id}>
                        <div className="border-b border-muted-foreground/30 pb-3" />
                        <p className="text-[10px] font-semibold mt-0.5">{sig.label || 'Responsável'}{sig.name ? ` — ${sig.name}` : ''}</p>
                        {sig.document && <p className="text-[9px] text-muted-foreground">{sig.document}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page (List) ─────────────────────────────────────────────────────────

export default function ChecklistTemplatesPage() {
  const { checklistTemplates } = useAppData();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [previewTemplate, setPreviewTemplate] = useState<ChecklistTemplate | null>(null);

  if (view === 'create') {
    return <ChecklistBuilderForm onDone={() => setView('list')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modelos de Checklist</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {checklistTemplates.length} modelo{checklistTemplates.length !== 1 ? 's' : ''} cadastrado{checklistTemplates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setView('create')} size="lg" className="field-touch gap-2">
          <Plus className="h-5 w-5" />
          Criar Novo
        </Button>
      </div>

      {/* Empty state */}
      {checklistTemplates.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
          <FileText className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="font-medium">Nenhum modelo cadastrado ainda</p>
          <p className="text-sm mt-1 mb-5">Crie um modelo para usar nas manutenções</p>
          <Button onClick={() => setView('create')} className="gap-2">
            <Plus className="h-4 w-4" /> Criar Primeiro Modelo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {checklistTemplates.map(template => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
              onClick={() => setPreviewTemplate(template)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 mt-0.5 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground leading-tight truncate">{template.title}</h3>
                    {template.locationName && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.locationName}</p>
                    )}
                    {template.companyName && (
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{template.companyName}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {template.equipment && template.equipment.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 gap-1">
                          <Settings className="h-2.5 w-2.5" />
                          {template.equipment.length} equip.
                        </Badge>
                      )}
                      {template.questions && template.questions.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 gap-1">
                          <HelpCircle className="h-2.5 w-2.5" />
                          {template.questions.length} perguntas
                        </Badge>
                      )}
                      {template.includePhotos && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 gap-1">
                          <Camera className="h-2.5 w-2.5" />
                          Fotos
                        </Badge>
                      )}
                      {template.signatories && template.signatories.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 gap-1">
                          <PenLine className="h-2.5 w-2.5" />
                          {template.signatories.length} assin.
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      {previewTemplate && (
        <ChecklistPreviewDialog
          template={previewTemplate}
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
