/**
 * @fileOverview Servicio de Gestión de Datos - Finanto
 * 
 * Este archivo es el "Cerebro" de los datos. Aquí decidimos cómo se guardan, 
 * cómo se borran y cómo se transforman las citas.
 * 
 * EXPLICACIÓN SIMPLE:
 * 1. El navegador tiene una pequeña "maleta" llamada LocalStorage.
 * 2. Esta maleta solo acepta TEXTO (Strings).
 * 3. Nosotros guardamos nuestras CITAS (Objetos) convirtiéndolas a texto y viceversa.
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
  differenceInDays 
} from 'date-fns';

// --- TIPOS DE DATOS (Las reglas de cómo debe verse una cita) ---

export type AppointmentStatus = 
  | 'Asistencia' 
  | 'No asistencia' 
  | 'Continuación en otra cita' 
  | 'Reagendó' 
  | 'Reembolso' 
  | 'Cierre';

export type AppointmentType = '1ra consulta' | '2da consulta' | 'cierre' | 'seguimiento';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string; // Fecha en formato ISO
  time: string; // Hora en formato "HH:mm"
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  isConfirmed?: boolean;
  isArchived?: boolean; // Si es TRUE, está en la papelera
}

// --- CONFIGURACIÓN ---
const STORAGE_KEY = 'finanto_data_v5'; // Nombre de nuestra "maleta" en el navegador

// --- FUNCIONES BÁSICAS (Las herramientas de bajo nivel) ---

/**
 * Guarda CUALQUIER lista de citas en el disco del navegador.
 * @param appointments La lista completa de citas a guardar.
 */
export const saveToDisk = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  // Convertimos la lista de objetos a un texto largo (JSON) para que quepa en la maleta
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

/**
 * Lee la lista de citas que tenemos guardada en el disco.
 * @returns Una lista de citas o una lista vacía si no hay nada.
 */
export const getFromDisk = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) return [];
  
  try {
    // Convertimos el texto largo de vuelta a una lista de objetos que JavaScript entiende
    return JSON.parse(rawData);
  } catch (e) {
    console.error("Error al leer de la maleta:", e);
    return [];
  }
};

/**
 * Transforma un número de teléfono a un formato bonito (Ej: 664 694 7418).
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = ('' + phone).replace(/\D/g, ''); // Quitamos todo lo que no sea número
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};

// --- FUNCIONES DE NEGOCIO (Lo que el programa usa directamente) ---

/**
 * Crea una cita nueva, le pone un ID único y la guarda.
 */
export const createAppointment = (data: Omit<Appointment, 'id' | 'isArchived'>): Appointment[] => {
  const all = getFromDisk();
  const newApp: Appointment = {
    ...data,
    id: uuidv4(), // Generamos una identificación única e irrepetible
    phone: formatPhoneNumber(data.phone),
    isArchived: false // Por defecto, una cita nueva NO está en la papelera
  };
  
  const updatedList = [newApp, ...all];
  saveToDisk(updatedList);
  return updatedList;
};

/**
 * Actualiza una cita existente. Puede cambiar el nombre, el estado o mandarla a la papelera.
 */
export const updateAppointment = (id: string, partialData: Partial<Appointment>): Appointment[] => {
  const all = getFromDisk();
  
  const updatedList = all.map(app => {
    if (app.id === id) {
      // Si el ID coincide, mezclamos los datos viejos con los nuevos
      const updated = { ...app, ...partialData };
      // Si el teléfono cambió, lo volvemos a poner bonito
      if (partialData.phone) updated.phone = formatPhoneNumber(partialData.phone);
      return updated;
    }
    return app;
  });
  
  saveToDisk(updatedList);
  return updatedList;
};

/**
 * Borra definitivamente una cita de la existencia. No hay vuelta atrás.
 */
export const deletePermanently = (id: string): Appointment[] => {
  const all = getFromDisk();
  const filtered = all.filter(app => app.id !== id);
  saveToDisk(filtered);
  return filtered;
};

/**
 * Genera datos de prueba para que la app no se vea vacía al iniciar.
 */
export const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'];
  
  for (let i = 0; i < 20; i++) {
    const randomDate = subDays(new Date(), Math.floor(Math.random() * 15));
    data.push({
      id: uuidv4(),
      name: `${names[i % names.length]} Test ${i + 1}`,
      phone: "664 123 4567",
      date: randomDate.toISOString(),
      time: "10:00",
      type: '1ra consulta',
      status: i % 2 === 0 ? 'Asistencia' : 'Cierre',
      isArchived: false,
      isConfirmed: true
    });
  }
  
  saveToDisk(data);
  return data;
};

/**
 * Calcula todas las estadísticas (Prospectos, Cierres, etc.) basándose en la lista actual.
 */
export const calculateStats = (appointments: Appointment[]) => {
  const now = new Date();
  const lastMonth = subMonths(now, 1);
  const active = appointments.filter(a => !a.isArchived);

  return {
    todayCount: active.filter(a => isToday(parseISO(a.date))).length,
    pendingCount: active.filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isToday(d) || isAfter(d, startOfDay(now))) && !a.status;
    }).length,
    currentMonthProspects: active.filter(a => {
      const d = parseISO(a.date);
      return isSameMonth(d, now) || isAfter(d, now);
    }).length,
    lastMonthProspects: active.filter(a => isSameMonth(parseISO(a.date), lastMonth)).length,
    currentMonthSales: active.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now)).length,
    lastMonthSales: active.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), lastMonth)).length,
  };
};
