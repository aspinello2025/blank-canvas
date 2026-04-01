export type LeadStatus = 'novo' | 'contato_iniciado' | 'qualificado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganho' | 'perdido';
export type LeadOrigin = 'google' | 'facebook' | 'instagram' | 'indicacao' | 'site' | 'outro';
export type LeadTag = 'quente' | 'morno' | 'frio' | 'urgente';
export type ActivityType = 'ligacao' | 'whatsapp' | 'reuniao' | 'proposta' | 'email' | 'outro';

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  origin: LeadOrigin;
  interest: string;
  notes: string;
  status: LeadStatus;
  responsibleId: string | null;
  proposalValue: number;
  proposalDate: string | null;
  proposalStatus: string;
  lostReason: string;
  tag: LeadTag | null;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  statusChangedAt: string;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  notes: string;
  userId: string | null;
  createdAt: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  userId: string | null;
  createdAt: string;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo Lead',
  contato_iniciado: 'Contato Iniciado',
  qualificado: 'Qualificado',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  fechado_ganho: 'Fechado (Ganho)',
  perdido: 'Perdido',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  contato_iniciado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  qualificado: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  proposta_enviada: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  negociacao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  fechado_ganho: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  perdido: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const LEAD_ORIGIN_LABELS: Record<LeadOrigin, string> = {
  google: 'Google Ads',
  facebook: 'Facebook',
  instagram: 'Instagram',
  indicacao: 'Indicação',
  site: 'Site',
  outro: 'Outro',
};

export const LEAD_TAG_LABELS: Record<LeadTag, string> = {
  quente: '🔥 Quente',
  morno: '🌤 Morno',
  frio: '❄️ Frio',
  urgente: '⚡ Urgente',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ligacao: '📞 Ligação',
  whatsapp: '💬 WhatsApp',
  reuniao: '🤝 Reunião',
  proposta: '📄 Proposta',
  email: '📧 Email',
  outro: '📝 Outro',
};

export const PIPELINE_ORDER: LeadStatus[] = [
  'novo', 'contato_iniciado', 'qualificado', 'proposta_enviada', 'negociacao', 'fechado_ganho', 'perdido'
];
