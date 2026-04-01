import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lead, LeadOrigin, LeadTag, LEAD_ORIGIN_LABELS, LEAD_TAG_LABELS } from '@/types/leads';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (lead: any) => Promise<{ error: any }>;
  initialData?: Lead | null;
}

export default function LeadForm({ open, onClose, onSave, initialData }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [origin, setOrigin] = useState<LeadOrigin>(initialData?.origin || 'outro');
  const [interest, setInterest] = useState(initialData?.interest || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [tag, setTag] = useState<LeadTag | ''>(initialData?.tag || '');
  const [utmSource, setUtmSource] = useState(initialData?.utmSource || '');
  const [utmMedium, setUtmMedium] = useState(initialData?.utmMedium || '');
  const [utmCampaign, setUtmCampaign] = useState(initialData?.utmCampaign || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!phone.trim()) { toast.error('Telefone é obrigatório'); return; }

    setSaving(true);
    const payload = {
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
      origin,
      interest: interest.trim(),
      notes: notes.trim(),
      status: initialData?.status || 'novo' as const,
      responsibleId: initialData?.responsibleId || null,
      tag: tag || null,
      utmSource: utmSource.trim(),
      utmMedium: utmMedium.trim(),
      utmCampaign: utmCampaign.trim(),
    };

    const { error } = await onSave(payload);
    setSaving(false);
    if (!error) {
      toast.success(initialData ? 'Lead atualizado!' : 'Lead cadastrado!');
      onClose();
    } else {
      toast.error('Erro ao salvar lead');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do lead" />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Empresa" />
            </div>
            <div>
              <Label>Telefone (WhatsApp) *</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Origem</Label>
              <Select value={origin} onValueChange={v => setOrigin(v as LeadOrigin)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_ORIGIN_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interesse</Label>
              <Input value={interest} onChange={e => setInterest(e.target.value)} placeholder="Tipo de serviço" />
            </div>
            <div>
              <Label>Tag</Label>
              <Select value={tag} onValueChange={v => setTag(v as LeadTag)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {Object.entries(LEAD_TAG_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">UTM / Rastreamento de Campanha</summary>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div><Label className="text-xs">UTM Source</Label><Input value={utmSource} onChange={e => setUtmSource(e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-xs">UTM Medium</Label><Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-xs">UTM Campaign</Label><Input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} className="h-8 text-xs" /></div>
            </div>
          </details>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
