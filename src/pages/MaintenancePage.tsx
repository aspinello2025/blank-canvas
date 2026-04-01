import { useState, useRef } from 'react';
import { useAppData } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Send, Camera, X, Image as ImageIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CHECKLIST_ITEMS, SUPPLY_UNIT_LABELS, PHOTO_TYPE_LABELS, type UsedSupply, type PhotoType, type MaintenancePhoto, type ChecklistTemplate } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function MaintenancePage() {
  const { locations, employees, supplies, checklistTemplates } = useAppData();
  const { isAdmin, user } = useAuth();
  const [locationId, setLocationId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [ph, setPh] = useState('');
  const [chlorine, setChlorine] = useState('');
  const [turbidity, setTurbidity] = useState('');
  const [temperature, setTemperature] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [usedSupplies, setUsedSupplies] = useState<{ supplyId: string; quantity: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<{ file: File; preview: string; type: PhotoType }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCheck = (key: string) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  const addUsedSupply = () => setUsedSupplies(prev => [...prev, { supplyId: '', quantity: 0 }]);
  const removeUsedSupply = (idx: number) => setUsedSupplies(prev => prev.filter((_, i) => i !== idx));
  const updateUsedSupply = (idx: number, field: keyof UsedSupply, value: string | number) => {
    setUsedSupplies(prev => prev.map((us, i) => i === idx ? { ...us, [field]: value } : us));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'depois' as PhotoType,
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updatePhotoType = (idx: number, type: PhotoType) => {
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, type } : p));
  };

  const uploadPhotos = async (): Promise<MaintenancePhoto[]> => {
    const uploaded: MaintenancePhoto[] = [];
    for (const photo of photos) {
      const ext = photo.file.name.split('.').pop();
      const path = `${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('maintenance-photos').upload(path, photo.file);
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      const { data: urlData } = supabase.storage.from('maintenance-photos').getPublicUrl(path);
      uploaded.push({
        id: crypto.randomUUID(),
        url: urlData.publicUrl,
        type: photo.type,
      });
    }
    return uploaded;
  };

  const handleSubmit = async () => {
    // For non-admin: find the employee record linked to current auth user
    const effectiveEmployeeId = isAdmin 
      ? employeeId 
      : (employees.find(e => e.authUserId === user?.id)?.id ?? user?.id ?? '');
    if (!locationId || !effectiveEmployeeId || !date) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    setUploading(true);
    try {
      const uploadedPhotos = await uploadPhotos();

      const { error } = await supabase.from('maintenances').insert({
        location_id: locationId,
        employee_id: effectiveEmployeeId,
        user_id: user?.id,
        date,
        start_time: startTime,
        end_time: endTime,
        ph: ph ? parseFloat(ph) : null,
        chlorine: chlorine ? parseFloat(chlorine) : null,
        turbidity: turbidity ? parseFloat(turbidity) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        template_id: selectedTemplateId,
        checklist: checklist as any,
        used_supplies: usedSupplies.filter(us => us.supplyId && us.quantity > 0) as any,
        photos: uploadedPhotos as any,
        notes,
      } as any);

      if (error) {
        console.error('Error saving maintenance:', error);
        toast.error(`Erro ao salvar: ${error.message}`);
        return;
      }

      toast.success('Manutenção registrada com sucesso!');
      // Reset
      setLocationId(''); setEmployeeId(''); setStartTime(''); setEndTime('');
      setPh(''); setChlorine(''); setTurbidity(''); setTemperature('');
      setChecklist({}); setUsedSupplies([]); setNotes(''); setSelectedTemplateId('');
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      setPhotos([]);
    } catch {
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nova Manutenção</h1>
        <p className="text-muted-foreground text-sm mt-1">Registre a manutenção realizada em campo</p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Informações Gerais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Local *</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="field-touch mt-1"><SelectValue placeholder="Selecione o local" /></SelectTrigger>
              <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {isAdmin && (
            <div><Label>Funcionário *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="field-touch mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{employees.filter(e => e.status === 'ativo').map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div><Label>Modelo de Checklist *</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="field-touch mt-1"><SelectValue placeholder="Selecione um modelo" /></SelectTrigger>
              <SelectContent>
                {checklistTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Data *</Label><Input type="date" className="field-touch mt-1" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Hora Início</Label><Input type="time" className="field-touch mt-1" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
            <div><Label>Hora Término</Label><Input type="time" className="field-touch mt-1" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Water Parameters */}
      <Card>
        <CardHeader><CardTitle className="text-base">Parâmetros da Água</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>pH</Label><Input type="number" step="0.1" className="field-touch mt-1" placeholder="7.0" value={ph} onChange={e => setPh(e.target.value)} /></div>
            <div><Label>Cloro (ppm)</Label><Input type="number" step="0.1" className="field-touch mt-1" placeholder="1.0" value={chlorine} onChange={e => setChlorine(e.target.value)} /></div>
            <div><Label>Turbidez (NTU)</Label><Input type="number" step="0.1" className="field-touch mt-1" placeholder="0.5" value={turbidity} onChange={e => setTurbidity(e.target.value)} /></div>
            <div><Label>Temperatura °C</Label><Input type="number" step="0.1" className="field-touch mt-1" placeholder="25" value={temperature} onChange={e => setTemperature(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>



      {/* Photos */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Fotos / Imagens</CardTitle>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-4 w-4 mr-1" /> Adicionar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {photos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              <ImageIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">Nenhuma foto adicionada</p>
              <p className="text-xs">Toque em "Adicionar" para tirar ou selecionar fotos</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-border">
                <img src={photo.preview} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover" />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="p-1.5">
                  <Select value={photo.type} onValueChange={(v) => updatePhotoType(idx, v as PhotoType)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PHOTO_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Used Supplies */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Insumos Utilizados</CardTitle>
          <Button variant="outline" size="sm" onClick={addUsedSupply}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {usedSupplies.length === 0 && <p className="text-sm text-muted-foreground">Nenhum insumo adicionado</p>}
          {usedSupplies.map((us, idx) => {
            const supply = supplies.find(s => s.id === us.supplyId);
            return (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <Select value={us.supplyId} onValueChange={v => updateUsedSupply(idx, 'supplyId', v)}>
                    <SelectTrigger className="field-touch"><SelectValue placeholder="Insumo" /></SelectTrigger>
                    <SelectContent>{supplies.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Input type="number" className="field-touch" placeholder="Qtd" value={us.quantity || ''} onChange={e => updateUsedSupply(idx, 'quantity', Number(e.target.value))} />
                </div>
                <span className="text-xs text-muted-foreground mb-3 w-8">{supply ? SUPPLY_UNIT_LABELS[supply.unit] : ''}</span>
                <button onClick={() => removeUsedSupply(idx)} className="p-2 mb-1 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={4} placeholder="Observações gerais sobre a manutenção..." value={notes} onChange={e => setNotes(e.target.value)} />
        </CardContent>
      </Card>

      {/* Dynamic Checklist Execution (Moved to Bottom) */}
      {selectedTemplateId ? (() => {
        const template = checklistTemplates.find(t => t.id === selectedTemplateId);
        if (!template) return null;
        return (
          <Card className="border-primary/50 border-2">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg text-primary">{template.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              
              {/* Equipment Verification Table */}
              {template.equipment && template.equipment.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm border-b pb-2">1. Verificação de Equipamentos</h3>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="py-2">Equipamento</TableHead>
                          <TableHead className="py-2">Potência</TableHead>
                          <TableHead className="py-2">Marca</TableHead>
                          <TableHead className="py-2 w-[80px]">Qtde</TableHead>
                          <TableHead className="py-2 w-[80px] text-center">Insp.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {template.equipment.map((eq, idx) => (
                          <TableRow key={eq.id || idx}>
                            <TableCell className="py-2 font-medium">{eq.name}</TableCell>
                            <TableCell className="py-2 text-muted-foreground">{eq.power}</TableCell>
                            <TableCell className="py-2 text-muted-foreground">{eq.brand}</TableCell>
                            <TableCell className="py-2 text-center">{eq.quantity}</TableCell>
                            <TableCell className="py-2 text-center">
                              <div className="flex justify-center">
                                <Checkbox 
                                  checked={!!checklist[`eq-${eq.id || idx}`]} 
                                  onCheckedChange={() => toggleCheck(`eq-${eq.id || idx}`)} 
                                  className="h-5 w-5 rounded-md"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Questions Section */}
              {template.questions && template.questions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm border-b pb-2">2. Respostas Obrigatórias do Checklist</h3>
                  <div className="space-y-4">
                    {template.questions.map((q, idx) => (
                      <div key={q.id} className="space-y-2 p-4 border rounded-lg bg-card/50 shadow-sm transition-colors hover:border-primary/30">
                        <Label className="text-sm font-medium flex items-start gap-2">
                          <span className="text-muted-foreground">{idx + 1}.</span> 
                          <span>{q.text} {q.required && <span className="text-destructive">*</span>}</span>
                        </Label>
                        {q.type === 'boolean' && (
                          <div className="flex items-center gap-3 mt-2 pl-5">
                             <Checkbox 
                               checked={!!checklist[q.id]} 
                               onCheckedChange={() => toggleCheck(q.id)} 
                               className="h-6 w-6 rounded-md" 
                             />
                             <span className="text-sm text-muted-foreground font-medium">
                               {checklist[q.id] ? 'Sim' : 'Não'}
                             </span>
                          </div>
                        )}
                        {q.type === 'text' && (
                          <div className="pl-5 mt-2">
                            <Input 
                              placeholder="Digite a resposta..." 
                              className="bg-background"
                              value={(checklist[q.id] as any as string) || ''}
                              onChange={(e) => setChecklist(prev => ({ ...prev, [q.id]: e.target.value as any }))}
                            />
                          </div>
                        )}
                        {q.type === 'number' && (
                          <div className="pl-5 mt-2">
                            <Input 
                              type="number" 
                              placeholder="Ex: 10" 
                              className="w-32 bg-background"
                              value={(checklist[q.id] as any as string) || ''}
                              onChange={(e) => setChecklist(prev => ({ ...prev, [q.id]: e.target.value as any }))}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {template.questions?.length === 0 && template.equipment?.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Este modelo de checklist está vazio.</p>
              )}
            </CardContent>
          </Card>
        );
      })() : (
        <Card className="border-dashed border-2">
          <CardHeader><CardTitle className="text-base">Checklist de Execução</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Selecione o "Modelo de Checklist" na parte superior do formulário para habilitar as perguntas dinâmicas e equipamentos aqui.
            </p>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubmit} size="lg" className="w-full field-touch text-base" disabled={uploading}>
        <Send className="h-5 w-5 mr-2" /> {uploading ? 'Enviando...' : 'Registrar Manutenção'}
      </Button>
    </div>
  );
}
