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

export const STORAGE_KEY = 'FINANTO_DATA_V1.1_50SEED';

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
 * Genera datos de prueba realistas (50 registros).
 */
export const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'Roberto', 'Sofía', 'Diego', 'Lucía', 'Fernando', 'Gabriela', 'Ricardo', 'Patricia', 'Héctor', 'Isabel', 'Jorge', 'Mónica', 'Andrés', 'Carmen'];
  const lastNames = ['Pérez', 'García', 'López', 'Martínez', 'Rodríguez', 'Gómez', 'Díaz', 'Ruiz', 'Torres', 'Morales', 'Vázquez', 'Jiménez', 'Castro', 'Ortiz', 'Álvarez', 'Flores', 'Ramos', 'Gutiérrez', 'Reyes', 'Blanco'];
  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'Cierre', 'Seguimiento'];
  const products: AppointmentProduct[] = ['Casa', 'Departamento', 'Terreno', 'Transporte', 'Préstamo'];
  const statuses: AppointmentStatus[] = ['Asistencia', 'No asistencia', 'Continuación en otra cita', 'Reagendó', 'Reembolso', 'Cierre', 'Apartado'];
  const hours = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];

  const now = new Date();

  // 25 Citas Próximas (Hoy y Futuro)
  for (let i = 0; i < 25; i++) {
    const daysAhead = Math.floor(i / 5); 
    const futureDate = addDays(now, daysAhead);
    const isTodayApp = isToday(futureDate);
    
    data.push({
      id: uuidv4(),
      name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      phone: `664 ${Math.floor(100+Math.random()*900)} ${Math.floor(1000+Math.random()*9000)}`,
      date: futureDate.toISOString(),
      time: hours[i % hours.length],
      type: types[i % types.length],
      product: products[i % products.length],
      isConfirmed: isTodayApp ? Math.random() > 0.5 : false,
      notes: `Nota de seguimiento #${i + 1}: Interesado en ${products[i % products.length]}. Requiere perfilamiento completo.`
    });
  }

  // 25 Citas Pasadas (Historial)
  for (let i = 0; i < 25; i++) {
    const pastDate = subDays(now, i + 1);
    data.push({
      id: uuidv4(),
      name: `${firstNames[(i + 5) % firstNames.length]} ${lastNames[(i + 5) % lastNames.length]}`,
      phone: `664 ${Math.floor(100+Math.random()*900)} ${Math.floor(1000+Math.random()*9000)}`,
      date: pastDate.toISOString(),
      time: hours[i % hours.length],
      type: types[i % types.length],
      product: products[i % products.length],
      status: statuses[i % statuses.length],
      isConfirmed: true,
      notes: `Registro histórico #${i + 1}. El cliente mostró interés pero ${statuses[i % statuses.length].toLowerCase()}.`
    });
  }
  
  saveToDisk(data);
  return data;
};

/**
 * Calcula las estadísticas globales enriquecidas.
 */
export const calculateStats = (appointments: Appointment[]) => {
  const now = new Date();
  const lastMonth = subMonths(now, 1);

  const currentMonthProspects = appointments.filter(a => isSameMonth(parseISO(a.date), now)).length;
  const currentMonthSales = appointments.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now)).length;
  const currentMonthApartados = appointments.filter(a => a.status === 'Apartado' && isSameMonth(parseISO(a.date), now)).length;
  
  const lastMonthProspects = appointments.filter(a => isSameMonth(parseISO(a.date), lastMonth)).length;
  const lastMonthSales = appointments.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), lastMonth)).length;

  const todayTotal = appointments.filter(a => isToday(parseISO(a.date))).length;
  const todayConfirmed = appointments.filter(a => isToday(parseISO(a.date)) && a.isConfirmed).length;
  const tomorrowTotal = appointments.filter(a => isToday(addDays(parseISO(a.date), -1))).length;

  const conversionRate = currentMonthProspects > 0 ? (currentMonthSales / currentMonthProspects) * 100 : 0;
  const lastMonthConversionRate = lastMonthProspects > 0 ? (lastMonthSales / lastMonthProspects) * 100 : 0;

  return {
    todayCount: todayTotal,
    todayConfirmed,
    tomorrowTotal,
    pendingCount: appointments.filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isToday(d) || isAfter(d, startOfDay(now))) && !a.status;
    }).length,
    currentMonthProspects,
    lastMonthProspects,
    currentMonthSales,
    currentMonthApartados,
    lastMonthSales,
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    lastMonthConversionRate: parseFloat(lastMonthConversionRate.toFixed(1)),
  };
};
