import { useState } from 'react';
import { useAppData } from '@/context/AppContext';
import { Plus, Trash2, Save, FileText, Settings, HelpCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ChecklistTemplate, EquipmentItem, ChecklistQuestion, QuestionType } from '@/types';

const DEFAULT_EQUIPMENT: Omit<EquipmentItem, 'id'>[] = [
  { name: 'Painel elétrico', power: '60a', brand: '', quantity: 1 },
  { name: 'Painel elétrico', power: '40a', brand: '', quantity: 1 },
  { name: 'Painel elétrico', power: '12a', brand: '', quantity: 1 },
  { name: 'Bomba de recalque', power: '0,5 cv', brand: 'Jacuzzi', quantity: 2 },
  { name: 'Bomba de hidrante', power: '5,0 cv', brand: 'Jacuzzi', quantity: 1 },
  { name: 'Bomba de piscina', power: '2,0 cv', brand: 'dancor', quantity: 1 },
  { name: 'Bomba de piscina', power: '0,75 cv', brand: 'sodramar', quantity: 1 },
];

export default function ChecklistBuilder() {
  const { addChecklistTemplate } = useAppData();

  const [title, setTitle] = useState('Chacklist de lugar 1');
  const [processNumber, setProcessNumber] = useState('300.262/2022 - 114/2022');
  const [companyName, setCompanyName] = useState('SSD COMÉRCIO E SERVIÇOS LTDA - EPP');
  const [locationName, setLocationName] = useState('CER Santa Paula');
  const [address, setAddress] = useState('Rua Luís Louza, 170 - Bairro Olímpico, São Caetano do Sul - SP');
  
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(
    DEFAULT_EQUIPMENT.map((eq, i) => ({ ...eq, id: `eq-${i}` }))
  );

  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);

  const handleAddEquipment = () => {
    setEquipmentList([...equipmentList, { id: `eq-${Date.now()}`, name: '', power: '', brand: '', quantity: 1 }]);
  };

  const handleUpdateEquipment = (id: string, field: keyof EquipmentItem, value: string | number) => {
    setEquipmentList(equipmentList.map(eq => eq.id === id ? { ...eq, [field]: value } : eq));
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter(eq => eq.id !== id));
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: `q-${Date.now()}`, text: '', type: 'boolean', required: true }]);
  };

  const handleUpdateQuestion = (id: string, field: keyof ChecklistQuestion, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = () => {
    if (!title) {
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
    };

    addChecklistTemplate(template);
    toast.success('Modelo de checklist salvo com sucesso!');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Modelo de Checklist</h1>
          <p className="text-muted-foreground mt-1">
            Crie um novo formato de relatório de manutenção com cabeçalho, equipamentos e perguntas.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Modelo
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Form Builder */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Configuração do Cabeçalho
              </CardTitle>
              <CardDescription>
                Defina as informações fixas que aparecerão no topo deste modelo de relatório.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do questionário</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Ex: Checklist de lugar 1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="process">Processo</Label>
                  <Input 
                    id="process" 
                    value={processNumber} 
                    onChange={(e) => setProcessNumber(e.target.value)} 
                    placeholder="Ex: 300.262/2022 - 114/2022"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input 
                    id="company" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input 
                    id="location" 
                    value={locationName} 
                    onChange={(e) => setLocationName(e.target.value)} 
                    placeholder="Nome do local"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Configuration */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Equipamentos da Manutenção
                </CardTitle>
                <CardDescription className="mt-1">
                  Lista de bombas, painéis e outros equipamentos fixos do local.
                </CardDescription>
              </div>
              <Button onClick={handleAddEquipment} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Equipamento
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
                      <TableHead className="w-[100px]">Qtde.</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentList.map((eq) => (
                      <TableRow key={eq.id}>
                        <TableCell>
                          <Input 
                            value={eq.name} 
                            onChange={(e) => handleUpdateEquipment(eq.id, 'name', e.target.value)}
                            placeholder="Nome do equipamento"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={eq.power} 
                            onChange={(e) => handleUpdateEquipment(eq.id, 'power', e.target.value)}
                            placeholder="Ex: 60a, 2.0 cv"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={eq.brand} 
                            onChange={(e) => handleUpdateEquipment(eq.id, 'brand', e.target.value)}
                            placeholder="Marca"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            min="1"
                            value={eq.quantity} 
                            onChange={(e) => handleUpdateEquipment(eq.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleRemoveEquipment(eq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {equipmentList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Nenhum equipamento cadastrado. Pressione "Adicionar Equipamento".
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
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Perguntas do Checklist
                </CardTitle>
                <CardDescription className="mt-1">
                  Crie os itens que o funcionário deverá preencher durante a manutenção.
                </CardDescription>
              </div>
              <Button onClick={handleAddQuestion} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Pergunta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20 relative group">
                  <div className="pt-2 cursor-move text-muted-foreground/50 hover:text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Pergunta {index + 1}</Label>
                        <Input 
                          value={q.text} 
                          onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
                          placeholder="Ex: A bomba de recalque apresenta vazamento?"
                        />
                      </div>
                      <div className="sm:w-48 space-y-2">
                        <Label>Tipo de Resposta</Label>
                        <Select
                          value={q.type}
                          onValueChange={(val) => handleUpdateQuestion(q.id, 'type', val as QuestionType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boolean">Sim / Não (Checkbox/Switch)</SelectItem>
                            <SelectItem value="text">Texto Livre</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch 
                          id={`req-${q.id}`} 
                          checked={q.required}
                          onCheckedChange={(checked) => handleUpdateQuestion(q.id, 'required', checked)}
                        />
                        <Label htmlFor={`req-${q.id}`} className="cursor-pointer font-normal text-muted-foreground">
                          Resposta obrigatória
                        </Label>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleRemoveQuestion(q.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {questions.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                  <HelpCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Seu checklist ainda não tem perguntas.</p>
                  <Button onClick={handleAddQuestion} variant="link" className="mt-2 text-primary">
                    Adicionar a primeira pergunta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg">Pré-visualização do Relatório</CardTitle>
              <CardDescription>Como o técnico verá este formulário</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-lg">{title || 'Título do questionário'}</h3>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Relatório de manutenção - Processo: {processNumber}</p>
                    <p className="font-semibold text-foreground/80">{companyName}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-left bg-muted/30 p-2 rounded">
                      <div>
                        <span className="font-semibold">Local:</span> <br/>{locationName}
                      </div>
                      <div>
                        <span className="font-semibold">Data:</span> <br/>{new Date().toLocaleDateString('pt-BR')}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">End.:</span> <br/>{address}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Funcionário:</span> <br/>João Silva (Técnico)
                      </div>
                    </div>
                  </div>
                </div>

                {equipmentList.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 border-b pb-1">EQUIPAMENTOS</h4>
                    <ul className="text-xs space-y-1">
                      {equipmentList.slice(0, 3).map(eq => (
                        <li key={eq.id} className="flex justify-between">
                          <span>{eq.quantity}x {eq.name}</span>
                          <span className="text-muted-foreground">{eq.power} {eq.brand}</span>
                        </li>
                      ))}
                      {equipmentList.length > 3 && (
                        <li className="text-muted-foreground italic text-center text-[10px] mt-2">
                          + {equipmentList.length - 3} outros equipamentos...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {questions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3 border-b pb-1">CHECKLIST</h4>
                    <div className="space-y-4">
                      {questions.map(q => (
                        <div key={q.id} className="space-y-1.5">
                          <Label className="text-xs">
                            {q.text || 'Pergunta sem texto'} {q.required && <span className="text-destructive">*</span>}
                          </Label>
                          {q.type === 'boolean' && (
                            <div className="flex items-center space-x-2">
                              <Switch id={`preview-${q.id}`} disabled />
                              <Label htmlFor={`preview-${q.id}`} className="text-xs text-muted-foreground">Sim / Não</Label>
                            </div>
                          )}
                          {q.type === 'text' && (
                            <Input placeholder="Resposta em texto..." disabled className="h-7 text-xs" />
                          )}
                          {q.type === 'number' && (
                            <Input type="number" placeholder="0" disabled className="h-7 text-xs w-24" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t space-y-8">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">OBS:</Label>
                    <div className="border-b border-foreground/30 w-full pb-4"></div>
                  </div>
                  <div className="space-y-1 pt-4">
                    <Label className="text-xs font-semibold">Responsável pelo setor:</Label>
                    <div className="border-b border-foreground/30 w-full pb-4"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
