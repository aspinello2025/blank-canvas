import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Location, Employee, Supply, Maintenance, UsedSupply, MaintenancePhoto, ChecklistTemplate } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const uid = () => crypto.randomUUID();

// Cast to any to call tables not yet in the generated Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface AppData {
  locations: Location[];
  employees: Employee[];
  supplies: Supply[];
  maintenances: Maintenance[];
  checklistTemplates: ChecklistTemplate[];
  addLocation: (loc: Omit<Location, 'id'>) => void;
  updateLocation: (loc: Location) => void;
  deleteLocation: (id: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  addSupply: (sup: Omit<Supply, 'id'>) => void;
  updateSupply: (sup: Supply) => void;
  deleteSupply: (id: string) => void;
  addMaintenance: (m: Maintenance) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteMaintenance: (id: string) => Promise<any>;
  addChecklistTemplate: (template: Omit<ChecklistTemplate, 'id'>) => void;
  getLowStockSupplies: () => Supply[];
}

const AppContext = createContext<AppData | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);

  useEffect(() => {
    async function fetchFromSupabase() {
      // Fetch Maintenances
      const { data: mData, error: mError } = await supabase
        .from('maintenances')
        .select('*')
        .order('date', { ascending: false });

      if (!mError && mData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMaintenances(mData.map((m: any) => ({
          id: m.id,
          locationId: m.location_id,
          employeeId: m.employee_id,
          date: m.date,
          startTime: m.start_time || '',
          endTime: m.end_time || '',
          ph: m.ph,
          chlorine: m.chlorine,
          turbidity: m.turbidity,
          temperature: m.temperature,
          checklist: (m.checklist || {}) as Record<string, boolean | string>,
          usedSupplies: ((m.used_supplies as any[]) || []) as UsedSupply[],
          photos: ((m.photos as any[]) || []) as MaintenancePhoto[],
          notes: m.notes || '',
          templateId: m.template_id
        })) as Maintenance[]);
      }

      // Fetch Employees (table confirmed to exist in DB)
      const { data: eData, error: eError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (!eError && eData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEmployees(eData.map((e: any) => ({
          id: e.id,
          name: e.name,
          phone: e.phone || '',
          role: e.role,
          status: e.status,
          authUserId: e.auth_user_id || null
        })));
      }

      // Fetch Locations (uses `db` cast — table created via migration)
      const { data: lData, error: lError } = await db
        .from('locations')
        .select('*')
        .order('name');

      if (!lError && lData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setLocations(lData.map((l: any) => ({
          id: l.id,
          name: l.name,
          cnpj: l.cnpj || '',
          structureType: l.structure_type || '',
          address: l.address || '',
          city: l.city || '',
          responsible: l.responsible || '',
          phone: l.phone || '',
          frequency: l.frequency || 'semanal',
          notes: l.notes || '',
          waterVolume: l.water_volume
        })));
      }

      // Fetch Supplies
      const { data: sData, error: sError } = await db
        .from('supplies')
        .select('*')
        .order('name');

      if (!sError && sData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSupplies(sData.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          unit: s.unit,
          currentStock: s.current_stock,
          minimumStock: s.minimum_stock,
          notes: s.notes || ''
        })));
      }

      // Fetch Checklist Templates
      const { data: tData, error: tError } = await db
        .from('checklist_templates')
        .select('*')
        .order('title');

      if (!tError && tData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setChecklistTemplates(tData.map((t: any) => ({
          id: t.id,
          title: t.title,
          processNumber: t.process_number,
          companyName: t.company_name,
          locationName: t.location_name,
          address: t.address,
          responsibleEmployee: t.responsible_employee,
          equipment: (t.equipment as unknown[]) || [],
          questions: (t.questions as unknown[]) || [],
          includePhotos: t.include_photos ?? true,
          signatories: (t.signatories as unknown[]) || []
        })));
      }
    }
    fetchFromSupabase();
  }, []);

  const addLocation = useCallback(async (loc: Omit<Location, 'id'>) => {
    const newLoc = { ...loc, id: uid() };
    setLocations(prev => [...prev, newLoc]);
    await db.from('locations').insert({
      id: newLoc.id,
      name: newLoc.name,
      cnpj: newLoc.cnpj,
      structure_type: newLoc.structureType,
      address: newLoc.address,
      city: newLoc.city,
      responsible: newLoc.responsible,
      phone: newLoc.phone,
      frequency: newLoc.frequency,
      notes: newLoc.notes,
      water_volume: newLoc.waterVolume
    });
  }, []);

  const updateLocation = useCallback(async (loc: Location) => {
    setLocations(prev => prev.map(l => l.id === loc.id ? loc : l));
    await db.from('locations').update({
      name: loc.name,
      cnpj: loc.cnpj,
      structure_type: loc.structureType,
      address: loc.address,
      city: loc.city,
      responsible: loc.responsible,
      phone: loc.phone,
      frequency: loc.frequency,
      notes: loc.notes,
      water_volume: loc.waterVolume
    }).eq('id', loc.id);
  }, []);

  const deleteLocation = useCallback(async (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    await db.from('locations').delete().eq('id', id);
  }, []);

  const addEmployee = useCallback(async (emp: Omit<Employee, 'id'>) => {
    const newEmp = { ...emp, id: uid() };
    setEmployees(prev => [...prev, newEmp]);
    await supabase.from('employees').insert({
      id: newEmp.id,
      name: newEmp.name,
      phone: newEmp.phone,
      role: newEmp.role,
      status: newEmp.status
    });
  }, []);

  const updateEmployee = useCallback(async (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    await supabase.from('employees').update({
      name: emp.name,
      phone: emp.phone,
      role: emp.role,
      status: emp.status
    }).eq('id', emp.id);
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    await supabase.from('employees').delete().eq('id', id);
  }, []);

  const addSupply = useCallback(async (sup: Omit<Supply, 'id'>) => {
    const newSup = { ...sup, id: uid() };
    setSupplies(prev => [...prev, newSup]);
    await db.from('supplies').insert({
      id: newSup.id,
      name: newSup.name,
      category: newSup.category,
      unit: newSup.unit,
      current_stock: newSup.currentStock,
      minimum_stock: newSup.minimumStock,
      notes: newSup.notes
    });
  }, []);

  const updateSupply = useCallback(async (sup: Supply) => {
    setSupplies(prev => prev.map(s => s.id === sup.id ? sup : s));
    await db.from('supplies').update({
      name: sup.name,
      category: sup.category,
      unit: sup.unit,
      current_stock: sup.currentStock,
      minimum_stock: sup.minimumStock,
      notes: sup.notes
    }).eq('id', sup.id);
  }, []);

  const deleteSupply = useCallback(async (id: string) => {
    setSupplies(prev => prev.filter(s => s.id !== id));
    await db.from('supplies').delete().eq('id', id);
  }, []);

  const addMaintenance = useCallback((m: Maintenance) => {
    setMaintenances(prev => [m, ...prev]);
    // Deduct stock locally (optimistic update)
    m.usedSupplies.forEach((us: UsedSupply) => {
      setSupplies(prev => prev.map(s =>
        s.id === us.supplyId ? { ...s, currentStock: Math.max(0, s.currentStock - us.quantity) } : s
      ));
    });
  }, []);

  const deleteMaintenance = useCallback(async (id: string) => {
    const { error } = await supabase.from('maintenances').delete().eq('id', id);
    if (!error) {
      setMaintenances(prev => prev.filter(m => m.id !== id));
    }
    return error;
  }, []);

  const addChecklistTemplate = useCallback(async (template: Omit<ChecklistTemplate, 'id'>) => {
    const newTemp = { ...template, id: uid() };
    setChecklistTemplates(prev => [...prev, newTemp]);
    await db.from('checklist_templates').insert({
      id: newTemp.id,
      title: newTemp.title,
      process_number: newTemp.processNumber,
      company_name: newTemp.companyName,
      location_name: newTemp.locationName,
      address: newTemp.address,
      responsible_employee: newTemp.responsibleEmployee,
      equipment: newTemp.equipment,
      questions: newTemp.questions,
      include_photos: newTemp.includePhotos ?? true,
      signatories: newTemp.signatories ?? []
    });
  }, []);

  const getLowStockSupplies = useCallback(() => {
    return supplies.filter(s => s.currentStock <= s.minimumStock);
  }, [supplies]);

  return (
    <AppContext.Provider value={{
      locations, employees, supplies, maintenances, checklistTemplates,
      addLocation, updateLocation, deleteLocation,
      addEmployee, updateEmployee, deleteEmployee,
      addSupply, updateSupply, deleteSupply,
      addMaintenance, deleteMaintenance, addChecklistTemplate, getLowStockSupplies,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
}
