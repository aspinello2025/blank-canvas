import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadActivity, LeadTask, LeadStatus } from '@/types/leads';

const db = supabase as any;

function mapLead(r: any): Lead {
  return {
    id: r.id,
    name: r.name,
    company: r.company || '',
    phone: r.phone || '',
    email: r.email || '',
    origin: r.origin,
    interest: r.interest || '',
    notes: r.notes || '',
    status: r.status,
    responsibleId: r.responsible_id,
    proposalValue: r.proposal_value || 0,
    proposalDate: r.proposal_date,
    proposalStatus: r.proposal_status || '',
    lostReason: r.lost_reason || '',
    tag: r.tag,
    utmSource: r.utm_source || '',
    utmMedium: r.utm_medium || '',
    utmCampaign: r.utm_campaign || '',
    statusChangedAt: r.status_changed_at,
    createdAt: r.created_at,
  };
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [lRes, aRes, tRes] = await Promise.all([
      db.from('leads').select('*').order('created_at', { ascending: false }),
      db.from('lead_activities').select('*').order('created_at', { ascending: false }),
      db.from('lead_tasks').select('*').order('due_date', { ascending: true }),
    ]);
    if (lRes.data) setLeads(lRes.data.map(mapLead));
    if (aRes.data) setActivities(aRes.data.map((a: any) => ({
      id: a.id, leadId: a.lead_id, type: a.type, notes: a.notes || '',
      userId: a.user_id, createdAt: a.created_at,
    })));
    if (tRes.data) setTasks(tRes.data.map((t: any) => ({
      id: t.id, leadId: t.lead_id, title: t.title, dueDate: t.due_date,
      completed: t.completed, userId: t.user_id, createdAt: t.created_at,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscription for leads
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'createdAt' | 'statusChangedAt'>) => {
    const { data, error } = await db.from('leads').insert({
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      origin: lead.origin,
      interest: lead.interest,
      notes: lead.notes,
      status: lead.status,
      responsible_id: lead.responsibleId,
      tag: lead.tag,
      utm_source: lead.utmSource,
      utm_medium: lead.utmMedium,
      utm_campaign: lead.utmCampaign,
    }).select().single();
    if (!error && data) {
      setLeads(prev => [mapLead(data), ...prev]);
    }
    return { data, error };
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.origin !== undefined) dbUpdates.origin = updates.origin;
    if (updates.interest !== undefined) dbUpdates.interest = updates.interest;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.status !== undefined) {
      dbUpdates.status = updates.status;
      dbUpdates.status_changed_at = new Date().toISOString();
    }
    if (updates.responsibleId !== undefined) dbUpdates.responsible_id = updates.responsibleId;
    if (updates.proposalValue !== undefined) dbUpdates.proposal_value = updates.proposalValue;
    if (updates.proposalDate !== undefined) dbUpdates.proposal_date = updates.proposalDate;
    if (updates.proposalStatus !== undefined) dbUpdates.proposal_status = updates.proposalStatus;
    if (updates.lostReason !== undefined) dbUpdates.lost_reason = updates.lostReason;
    if (updates.tag !== undefined) dbUpdates.tag = updates.tag;
    if (updates.utmSource !== undefined) dbUpdates.utm_source = updates.utmSource;
    if (updates.utmMedium !== undefined) dbUpdates.utm_medium = updates.utmMedium;
    if (updates.utmCampaign !== undefined) dbUpdates.utm_campaign = updates.utmCampaign;

    const { error } = await db.from('leads').update(dbUpdates).eq('id', id);
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, statusChangedAt: dbUpdates.status_changed_at || l.statusChangedAt } : l));
    }
    return { error };
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    const { error } = await db.from('leads').delete().eq('id', id);
    if (!error) setLeads(prev => prev.filter(l => l.id !== id));
    return { error };
  }, []);

  const addActivity = useCallback(async (activity: { leadId: string; type: string; notes: string }) => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await db.from('lead_activities').insert({
      lead_id: activity.leadId,
      type: activity.type,
      notes: activity.notes,
      user_id: user?.id,
    }).select().single();
    if (!error && data) {
      setActivities(prev => [{ id: data.id, leadId: data.lead_id, type: data.type, notes: data.notes || '', userId: data.user_id, createdAt: data.created_at }, ...prev]);
    }
    return { error };
  }, []);

  const addTask = useCallback(async (task: { leadId: string; title: string; dueDate: string }) => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await db.from('lead_tasks').insert({
      lead_id: task.leadId,
      title: task.title,
      due_date: task.dueDate,
      user_id: user?.id,
    }).select().single();
    if (!error && data) {
      setTasks(prev => [...prev, { id: data.id, leadId: data.lead_id, title: data.title, dueDate: data.due_date, completed: data.completed, userId: data.user_id, createdAt: data.created_at }]);
    }
    return { error };
  }, []);

  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    await db.from('lead_tasks').update({ completed }).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
  }, []);

  return { leads, activities, tasks, loading, addLead, updateLead, deleteLead, addActivity, addTask, toggleTask, refetch: fetchAll };
}
