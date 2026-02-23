/**
 * @fileOverview Servicio de Gestión de Datos - Finanto
 * 
 * Centraliza la persistencia y lógica de negocio.
 * Se han eliminado las funciones de archivado y borrado permanente para simplificar el flujo.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  isToday, 
  isAfter, 
  isBefore, 
  startOfDay, 
  parseISO, 
  subMonths, 
  isSameMonth, 
  subDays, 
  addDays, 
} from 'date-fns';

export type AppointmentStatus = 
  | 'Asistencia' 
  | 'No asistencia' 
  | 'Continuación en otra cita' 
  | 'Reagendó' 
  | 'Apartado' 
  | 'Reembolso' 
  | 'Cierre';

export type AppointmentType = '1ra consulta' | '2da consulta' | 'Cierre' | 'Seguimiento';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  isConfirmed?: boolean;
}

const STORAGE_KEY = 'FINANTO_DATA_V05_CLEAN';

export const saveToDisk = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

export const getFromDisk = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) return [];
  try {
    return JSON.parse(rawData);
  } catch (e) {
    return [];
  }
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = ('' + phone).replace(/\D/g, ''); 
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) return `${match[1]} ${match[2]} ${match[3]}`;
  return phone;
};

export const createAppointment = (data: Omit<Appointment, 'id'>): Appointment[] => {
  const all = getFromDisk();
  const newApp: Appointment = {
    ...data,
    id: uuidv4(),
    phone: formatPhoneNumber(data.phone),
  };
  const updatedList = [newApp, ...all];
  saveToDisk(updatedList);
  return updatedList;
};

export const updateAppointment = (id: string, partialData: Partial<Appointment>): Appointment[] => {
  const all = getFromDisk();
  const updatedList = all.map(app => {
    if (app.id === id) {
      const updated = { ...app, ...partialData };
      if (partialData.phone) updated.phone = formatPhoneNumber(partialData.phone);
      return updated;
    }
    return app;
  });
  saveToDisk(updatedList);
  return updatedList;
};

export const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 'Elena Gómez', 'Roberto Díaz', 'Sofía Ruiz', 'Diego Torres', 'Lucía Morales'];
  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'Cierre', 'Seguimiento'];
  const statuses: AppointmentStatus[] = ['Asistencia', 'No asistencia', 'Continuación en otra cita', 'Reagendó', 'Apartado', 'Reembolso', 'Cierre'];
  const hours = ['09:00', '10:30', '12:00', '14:30', '16:00', '17:30'];

  const now = new Date();

  // 3 Citas para Hoy
  for (let i = 0; i < 3; i++) {
    data.push({
      id: uuidv4(),
      name: `${names[i]} (Hoy)`,
      phone: "664 111 2233",
      date: now.toISOString(),
      time: hours[i],
      type: types[i % types.length],
      notes: "Cita programada para hoy."
    });
  }

  // 2 Citas Pasado Mañana
  for (let i = 0; i < 2; i++) {
    const futureDate = addDays(now, 2);
    data.push({
      id: uuidv4(),
      name: `${names[i+3]} (Pasado Mañana)`,
      phone: "664 444 5566",
      date: futureDate.toISOString(),
      time: hours[i+2],
      type: types[i % types.length],
    });
  }

  // 5 Citas del mes pasado
  const lastMonth = subMonths(now, 1);
  for (let i = 0; i < 5; i++) {
    const pastDate = subDays(lastMonth, i + 5);
    data.push({
      id: uuidv4(),
      name: `${names[i+5]} (Histórico)`,
      phone: "664 777 8899",
      date: pastDate.toISOString(),
      time: hours[i],
      type: types[i % types.length],
      status: i === 0 ? 'Cierre' : statuses[i % statuses.length],
      isConfirmed: true,
    });
  }
  
  saveToDisk(data);
  return data;
};

export const calculateStats = (appointments: Appointment[]) => {
  const now = new Date();
  const lastMonth = subMonths(now, 1);

  return {
    todayCount: appointments.filter(a => isToday(parseISO(a.date))).length,
    pendingCount: appointments.filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isToday(d) || isAfter(d, startOfDay(now))) && !a.status;
    }).length,
    currentMonthProspects: appointments.filter(a => {
      const d = parseISO(a.date);
      return isSameMonth(d, now) || isAfter(d, now);
    }).length,
    lastMonthProspects: appointments.filter(a => isSameMonth(parseISO(a.date), lastMonth)).length,
    currentMonthSales: appointments.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now)).length,
    lastMonthSales: appointments.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), lastMonth)).length,
  };
};