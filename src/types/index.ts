export type StructureType = 'piscina_publica' | 'fonte_ornamental' | 'espelho_dagua' | 'lago_artificial' | 'outro';
export type MaintenanceFrequency = 'diaria' | 'semanal' | 'quinzenal' | 'mensal';
export type EmployeeStatus = 'ativo' | 'inativo';
export type SupplyCategory = 'cloro' | 'algicida' | 'clarificante' | 'redutor_ph' | 'elevador_ph' | 'outro';
export type SupplyUnit = 'litro' | 'ml' | 'kg' | 'g' | 'unidade';
export type PhotoType = 'antes' | 'depois' | 'medicao' | 'irregularidade';

export interface Location {
  id: string;
  name: string;
  cnpj?: string;
  structureType: string;
  address: string;
  city: string;
  responsible: string;
  phone: string;
  frequency: MaintenanceFrequency;
  notes: string;
  waterVolume?: number;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  username?: string;
  role: string;
  status: EmployeeStatus;
  authUserId?: string | null;
}

export interface Supply {
  id: string;
  name: string;
  category: SupplyCategory;
  unit: SupplyUnit;
  currentStock: number;
  minimumStock: number;
  notes: string;
}

export interface MaintenancePhoto {
  id: string;
  url: string;
  type: PhotoType;
}

export interface UsedSupply {
  supplyId: string;
  quantity: number;
}

export interface Maintenance {
  id: string;
  locationId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  ph: number | null;
  chlorine: number | null;
  turbidity: number | null;
  temperature: number | null;
  templateId?: string;
  checklist: Record<string, any>;
  usedSupplies: UsedSupply[];
  photos: MaintenancePhoto[];
  notes: string;
}

export const STRUCTURE_TYPE_LABELS: Record<StructureType, string> = {
  piscina_publica: 'Piscina Pública',
  fonte_ornamental: 'Fonte Ornamental',
  espelho_dagua: 'Espelho d\'Água',
  lago_artificial: 'Lago Artificial',
  outro: 'Outro',
};

export const FREQUENCY_LABELS: Record<MaintenanceFrequency, string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
};

export const SUPPLY_CATEGORY_LABELS: Record<SupplyCategory, string> = {
  cloro: 'Cloro',
  algicida: 'Algicida',
  clarificante: 'Clarificante',
  redutor_ph: 'Redutor de pH',
  elevador_ph: 'Elevador de pH',
  outro: 'Outro',
};

export const SUPPLY_UNIT_LABELS: Record<SupplyUnit, string> = {
  litro: 'Litro',
  ml: 'mL',
  kg: 'Kg',
  g: 'g',
  unidade: 'Unidade',
};

export const CHECKLIST_ITEMS: Record<string, string> = {
  limpeza: 'Limpeza realizada',
  aspiracao: 'Aspiração',
  filtros: 'Limpeza de filtros',
  residuos: 'Remoção de resíduos',
  bordas: 'Limpeza de bordas',
  fonte: 'Limpeza da fonte',
  inspecao: 'Inspeção visual de bombas e filtros',
  outros: 'Outros serviços realizados',
};

export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  antes: 'Antes do serviço',
  depois: 'Depois do serviço',
  medicao: 'Medição da água',
  irregularidade: 'Irregularidade encontrada',
};

// --- Form Builder / Checklist Templates Types ---

export type QuestionType = 'boolean' | 'text' | 'number';

export interface ChecklistQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  power: string;
  brand: string;
  quantity: number;
}

export interface ChecklistSignatory {
  id: string;
  label: string;   // e.g. "Responsável pelo setor"
  name: string;    // pre-filled name (optional)
  document: string; // CPF, RG, CREA etc.
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  processNumber: string;
  companyName: string;
  locationName: string;
  address: string;
  responsibleEmployee: string;
  equipment: EquipmentItem[];
  questions: ChecklistQuestion[];
  includePhotos?: boolean;
  signatories?: ChecklistSignatory[];
}
