/**
 * @fileOverview Servicio de Gestión de Datos - Finanto
 * 
 * Este archivo es el "Cerebro" de los datos. Aquí centralizamos todo el manejo
 * de la información que se guarda en tu navegador (LocalStorage).
 * 
 * EXPLICACIÓN SIMPLE PARA HUMANOS:
 * 1. El navegador tiene una "maleta" (LocalStorage) donde guardamos datos.
 * 2. Esta maleta solo entiende TEXTO.
 * 3. Nosotros convertimos nuestras CITAS (objetos) a TEXTO para guardarlas (JSON.stringify).
 * 4. Cuando las necesitamos, convertimos ese TEXTO de vuelta a CITAS (JSON.parse).
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

// --- TIPOS DE DATOS (Las reglas de cómo debe verse una cita) ---

export type AppointmentStatus = 
  | 'Asistencia' 
  | 'Sin asistencia' 
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
  date: string; // Guardamos la fecha como un texto largo estandarizado (ISO)
  time: string; // Hora en formato "14:30"
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  isConfirmed?: boolean;
  isArchived?: boolean; // Si es TRUE, el usuario la "borró" y está en la papelera
}

// --- CONFIGURACIÓN ---
const STORAGE_KEY = 'FINANTO_DATA_V05'; // Nombre de nuestra maleta en el disco

// --- FUNCIONES BÁSICAS (Las herramientas de persistencia) ---

/**
 * Función para guardar TODO el listado en el disco inmediatamente.
 */
export const saveToDisk = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  // Convertimos la lista de objetos a texto para que quepa en la maleta
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

/**
 * Función para leer lo que hay en el disco actualmente.
 */
export const getFromDisk = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) return [];
  
  try {
    // Convertimos el texto de vuelta a una lista de objetos que React entiende
    return JSON.parse(rawData);
  } catch (e) {
    console.error("Error al leer los datos del disco:", e);
    return [];
  }
};

/**
 * Función para poner los teléfonos bonitos automáticamente (Ej: 664 123 4567).
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = ('' + phone).replace(/\D/g, ''); 
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};

// --- FUNCIONES DE NEGOCIO (Lo que el programa usa para trabajar) ---

/**
 * Agrega una nueva cita al sistema y la guarda al instante.
 */
export const createAppointment = (data: Omit<Appointment, 'id' | 'isArchived'>): Appointment[] => {
  const all = getFromDisk();
  const newApp: Appointment = {
    ...data,
    id: uuidv4(), // Le damos un DNI único a la cita
    phone: formatPhoneNumber(data.phone),
    isArchived: false // Por defecto no está en la papelera
  };
  
  const updatedList = [newApp, ...all];
  saveToDisk(updatedList);
  return updatedList;
};

/**
 * Actualiza cualquier dato de una cita (Nombre, estado, archivado, etc).
 */
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

/**
 * Borra una cita de la existencia para siempre.
 */
export const deletePermanently = (id: string): Appointment[] => {
  const all = getFromDisk();
  const filtered = all.filter(app => app.id !== id);
  saveToDisk(filtered);
  return filtered;
};

/**
 * Genera datos de prueba realistas (Seed Data).
 */
export const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 'Elena Gómez', 'Roberto Díaz', 'Sofía Ruiz', 'Diego Torres', 'Lucía Morales'];
  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'Cierre', 'Seguimiento'];
  const statuses: AppointmentStatus[] = ['Asistencia', 'Sin asistencia', 'Continuación en otra cita', 'Reagendó', 'Apartado', 'Reembolso', 'Cierre'];
  const hours = ['09:00', '10:30', '12:00', '14:30', '16:00', '17:30', '11:15', '13:45'];

  const now = new Date();

  // 1. 3 Citas para HOY (Sin confirmar, sin asistir - Para el flujo de "Hoy")
  for (let i = 0; i < 3; i++) {
    data.push({
      id: uuidv4(),
      name: `${names[i % names.length]} (Hoy)`,
      phone: "664 111 2233",
      date: now.toISOString(),
      time: hours[i % hours.length],
      type: types[i % types.length],
      isConfirmed: false,
      isArchived: false,
      notes: "Cita programada para el día de hoy, pendiente de confirmar asistencia."
    });
  }

  // 2. 2 Citas PENDIENTES (Futuras - Para los siguientes días)
  for (let i = 0; i < 2; i++) {
    const futureDate = addDays(now, i + 1);
    data.push({
      id: uuidv4(),
      name: `${names[(i + 3) % names.length]} (Pendiente)`,
      phone: "664 444 5566",
      date: futureDate.toISOString(),
      time: hours[(i + 3) % hours.length],
      type: types[i % types.length],
      isConfirmed: false,
      isArchived: false,
      notes: "Cita para seguimiento en días próximos."
    });
  }

  // 3. 5 Citas del MES ANTERIOR (Pasadas - Para llenar historial e ingresos pasados)
  const lastMonth = subMonths(now, 1);
  for (let i = 0; i < 5; i++) {
    const pastDate = subDays(lastMonth, i + 5);
    data.push({
      id: uuidv4(),
      name: `${names[(i + 5) % names.length]} (Histórico)`,
      phone: "664 777 8899",
      date: pastDate.toISOString(),
      time: hours[(i + 5) % hours.length],
      type: types[i % types.length],
      status: i === 0 ? 'Cierre' : statuses[i % statuses.length],
      isConfirmed: true,
      isArchived: false,
      notes: "Registro de actividad del mes pasado para estadísticas comparativas."
    });
  }

  // 4. 10 Citas aleatorias para rellenar el mes actual
  for (let i = 0; i < 10; i++) {
    const randomDate = subDays(now, Math.floor(Math.random() * 15) + 1);
    data.push({
      id: uuidv4(),
      name: names[(i + 10) % names.length],
      phone: "664 999 0000",
      date: randomDate.toISOString(),
      time: hours[Math.floor(Math.random() * hours.length)],
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      isConfirmed: true,
      isArchived: false,
      notes: "Cita de historial del mes corriente."
    });
  }
  
  saveToDisk(data);
  return data;
};

/**
 * Calcula todas las estadísticas basándose en la lista actual.
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
    // Prospectos del mes: Todo lo programado para este mes en adelante
    currentMonthProspects: active.filter(a => {
      const d = parseISO(a.date);
      return isSameMonth(d, now) || isAfter(d, now);
    }).length,
    lastMonthProspects: active.filter(a => isSameMonth(parseISO(a.date), lastMonth)).length,
    currentMonthSales: active.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now)).length,
    lastMonthSales: active.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), lastMonth)).length,
  };
};
