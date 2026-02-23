/**
 * @fileOverview Servicio de Gestión de Datos - Finanto
 * 
 * Centraliza la persistencia y lógica de negocio.
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
  | 'Reembolso' 
  | 'Cierre'
  | 'Apartado';

export type AppointmentType = '1ra consulta' | '2da consulta' | 'Cierre' | 'Seguimiento';

export type AppointmentProduct = 'Casa' | 'Departamento' | 'Terreno' | 'Transporte' | 'Préstamo';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  type: AppointmentType;
  product?: AppointmentProduct;
  status?: AppointmentStatus;
  notes?: string;
  isConfirmed?: boolean;
}

const STORAGE_KEY = 'FINANTO_DATA_V07';

/**
 * Guarda la lista de citas en el almacenamiento local (localStorage).
 */
export const saveToDisk = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

/**
 * Recupera las citas guardadas.
 */
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

/**
 * Formatea un número de teléfono a un estilo legible.
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = ('' + phone).replace(/\D/g, ''); 
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) return `${match[1]} ${match[2]} ${match[3]}`;
  return phone;
};

/**
 * Crea una nueva cita y la guarda.
 */
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

/**
 * Actualiza una cita existente por su ID.
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
 * Genera datos de prueba realistas.
 */
export const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'Roberto', 'Sofía', 'Diego', 'Lucía'];
  const lastNames = ['Pérez', 'García', 'López', 'Martínez', 'Rodríguez', 'Gómez', 'Díaz', 'Ruiz', 'Torres', 'Morales'];
  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'Cierre', 'Seguimiento'];
  const products: AppointmentProduct[] = ['Casa', 'Departamento', 'Terreno', 'Transporte', 'Préstamo'];
  const statuses: AppointmentStatus[] = ['Asistencia', 'No asistencia', 'Continuación en otra cita', 'Reagendó', 'Reembolso', 'Cierre', 'Apartado'];
  const hours = ['09:00', '10:30', '12:00', '14:30', '16:00', '17:30'];

  const now = new Date();

  // 3 Citas para Hoy
  for (let i = 0; i < 3; i++) {
    data.push({
      id: uuidv4(),
      name: `${firstNames[i]} ${lastNames[i]} (Test)`,
      phone: "664 111 2233",
      date: now.toISOString(),
      time: hours[i % hours.length],
      type: types[i % types.length],
      product: products[i % products.length],
      notes: "Prospecto de prueba para el día de hoy."
    });
  }

  // 2 Citas Pendientes (Mañana y Pasado)
  for (let i = 0; i < 2; i++) {
    const futureDate = addDays(now, i + 1);
    data.push({
      id: uuidv4(),
      name: `${firstNames[i+3]} ${lastNames[i+3]} (Test)`,
      phone: "664 444 5566",
      date: futureDate.toISOString(),
      time: hours[(i+2) % hours.length],
      type: types[i % types.length],
      product: products[(i+2) % products.length],
      notes: "Cita programada a futuro."
    });
  }

  // 5 Citas del mes pasado (Historial)
  const lastMonth = subMonths(now, 1);
  for (let i = 0; i < 5; i++) {
    const pastDate = subDays(lastMonth, i + 5);
    data.push({
      id: uuidv4(),
      name: `${firstNames[i+5]} ${lastNames[i+5]} (Test)`,
      phone: "664 777 8899",
      date: pastDate.toISOString(),
      time: hours[i % hours.length],
      type: types[i % types.length],
      product: products[i % products.length],
      status: statuses[i % statuses.length],
      isConfirmed: true,
      notes: "Historial del mes pasado."
    });
  }

  // Una cita adicional con estado 'Apartado' para demostración
  data.push({
    id: uuidv4(),
    name: "Alejandro Ruiz (Test)",
    phone: "664 999 0011",
    date: subDays(now, 2).toISOString(),
    time: "11:00",
    type: "2da consulta",
    product: "Casa",
    status: "Apartado",
    isConfirmed: true,
    notes: "Cliente interesado, ya realizó el apartado."
  });
  
  saveToDisk(data);
  return data;
};

/**
 * Calcula las estadísticas globales.
 */
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
