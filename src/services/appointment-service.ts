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
  getDay
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
  // Datos de comisión
  commissionPercent?: number;
  commissionStatus?: 'Pagada' | 'Pendiente';
  finalCreditAmount?: number;
  // Datos de prospectador externo
  prospectorName?: string;
  prospectorPhone?: string;
}

export const STORAGE_KEY = 'FINANTO_DATA_V1.1_50SEED';

/**
 * Calcula la fecha de pago estimada para una comisión.
 */
export const getCommissionPaymentDate = (dateStr: string): Date => {
  const d = parseISO(dateStr);
  const dayOfWeek = getDay(d); // 0=Dom, 1=Lun, 2=Mar, 3=Mié...
  
  let daysToAdd = 0;
  if (dayOfWeek <= 2) {
    // Domingo a Martes -> Viernes de la siguiente semana
    daysToAdd = (5 - dayOfWeek) + 7;
  } else {
    // Miércoles a Sábado -> Viernes de la subsiguiente semana
    daysToAdd = (5 - dayOfWeek) + 14;
  }
  
  return addDays(d, daysToAdd);
};

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
    return JSON.parse(rawData) as Appointment[];
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
    phone: formatPhoneNumber(data.phone)
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
 * Genera datos de prueba realistas y variados (60 registros).
 */
export const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  
  const firstNames = [
    'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'Roberto', 'Sofía', 'Diego', 'Lucía', 
    'Fernando', 'Gabriela', 'Ricardo', 'Patricia', 'Héctor', 'Isabel', 'Jorge', 'Mónica', 'Andrés', 'Carmen',
    'Alejandro', 'Daniela', 'Raúl', 'Verónica', 'Víctor', 'Adriana', 'Oscar', 'Paola', 'Miguel', 'Rosa',
    'Francisco', 'Lorena', 'Eduardo', 'Ximena', 'Ramiro', 'Natalia', 'Esteban', 'Silvia', 'Javier', 'Beatriz',
    'Manuel', 'Julia', 'Alberto', 'Teresa', 'Felipe', 'Inés', 'Enrique', 'Clara', 'Mario', 'Andrea',
    'Raquel', 'Samuel', 'Paula', 'Arturo', 'Elisa', 'Ignacio', 'Lidia', 'Ramón', 'Gloria', 'Hugo'
  ];
  
  const lastNames = [
    'Pérez', 'García', 'López', 'Martínez', 'Rodríguez', 'Gómez', 'Díaz', 'Ruiz', 'Torres', 'Morales', 
    'Vázquez', 'Jiménez', 'Castro', 'Ortiz', 'Álvarez', 'Flores', 'Ramos', 'Gutiérrez', 'Reyes', 'Blanco',
    'Sánchez', 'Ramírez', 'Hernández', 'Navarro', 'Delgado', 'Cano', 'Mendoza', 'Marín', 'Medina', 'Vega',
    'Moreno', 'Solís', 'Vargas', 'Herrera', 'Cortes', 'Mora', 'Ríos', 'Aguilar', 'Pascual', 'Rojo',
    'Galán', 'Garzón', 'Suárez', 'Ibarra', 'Valdez', 'Peralta', 'Gallegos', 'Montero', 'Hidalgo', 'Ortega',
    'Rivas', 'Soto', 'Mejía', 'Guerra', 'Bermúdez', 'Acosta', 'Salazar', 'Figueroa', 'Villalobos', 'Arias'
  ];

  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'Cierre', 'Seguimiento'];
  const products: AppointmentProduct[] = ['Casa', 'Departamento', 'Terreno', 'Transporte', 'Préstamo'];
  const statuses: AppointmentStatus[] = ['Asistencia', 'No asistencia', 'Continuación en otra cita', 'Reagendó', 'Reembolso', 'Cierre', 'Apartado'];
  const hours = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];

  const now = new Date();

  const getName = (index: number) => {
    const fname = firstNames[index % firstNames.length];
    const lname = lastNames[(index + 5) % lastNames.length];
    return `${fname} ${lname}`;
  };

  const getPhone = (index: number) => {
    const base = 6640000000 + (index * 12345) % 9999999;
    return base.toString().substring(0, 10);
  };

  // 30 Citas Próximas
  for (let i = 0; i < 30; i++) {
    let appDate;
    if (i < 6) appDate = now; 
    else if (i < 12) appDate = addDays(now, 1);
    else appDate = addDays(now, (i % 7) + 2);
    
    const isTodayApp = isToday(appDate);
    
    data.push({
      id: uuidv4(),
      name: getName(i),
      phone: formatPhoneNumber(getPhone(i)),
      date: appDate.toISOString(),
      time: hours[i % hours.length],
      type: types[i % types.length],
      product: products[i % products.length],
      isConfirmed: isTodayApp ? Math.random() > 0.4 : false,
      notes: i % 3 === 0 ? `Cliente muy interesado en ${products[i % products.length]}. Requiere crédito alto.` : '',
      prospectorName: i % 4 === 0 ? `Agente Externo ${i}` : undefined,
      prospectorPhone: i % 4 === 0 ? formatPhoneNumber(getPhone(i + 100)) : undefined
    });
  }

  // 30 Citas Pasadas
  for (let i = 0; i < 30; i++) {
    const pastDate = i < 5 ? subDays(now, 1) : i < 15 ? subDays(now, (i % 14) + 2) : subMonths(now, 1);
    const globalIndex = i + 30;
    const status = statuses[i % statuses.length];
    const isSale = status === 'Cierre' || status === 'Apartado';
    
    data.push({
      id: uuidv4(),
      name: getName(globalIndex),
      phone: formatPhoneNumber(getPhone(globalIndex)),
      date: pastDate.toISOString(),
      time: hours[i % hours.length],
      type: types[i % types.length],
      product: products[i % products.length],
      status: status,
      isConfirmed: true,
      notes: isSale ? `Venta exitosa. Expediente completo enviado a notaría.` : `Seguimiento de ${products[i % products.length]}.`,
      commissionStatus: isSale ? (i % 2 === 0 ? 'Pagada' : 'Pendiente') : undefined,
      commissionPercent: isSale ? (i % 3 === 0 ? 50 : 100) : undefined,
      finalCreditAmount: isSale ? Math.floor(300000 + Math.random() * 1700000) : undefined,
      prospectorName: i % 5 === 0 ? `Prospectador Senior ${i}` : undefined,
      prospectorPhone: i % 5 === 0 ? formatPhoneNumber(getPhone(globalIndex + 50)) : undefined
    });
  }
  
  saveToDisk(data);
  return data;
};

/**
 * Calcula las estadísticas globales enriquecidas.
 */
export const calculateStats = (appointments: Appointment[]) => {
  const activeApps = appointments;
  const now = new Date();
  const lastMonth = subMonths(now, 1);

  const currentMonthProspects = activeApps.filter(a => isSameMonth(parseISO(a.date), now)).length;
  const lastMonthProspects = activeApps.filter(a => isSameMonth(parseISO(a.date), lastMonth)).length;

  const currentMonthSales = activeApps.filter(a => (a.status === 'Cierre' || a.status === 'Apartado') && isSameMonth(parseISO(a.date), now)).length;
  const lastMonthSales = activeApps.filter(a => (a.status === 'Cierre' || a.status === 'Apartado') && isSameMonth(parseISO(a.date), lastMonth)).length;

  const currentMonthOnlyCierre = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), now)).length;
  const lastMonthOnlyCierre = activeApps.filter(a => a.status === 'Cierre' && isSameMonth(parseISO(a.date), lastMonth)).length;

  const currentMonthApartados = activeApps.filter(a => a.status === 'Apartado' && isSameMonth(parseISO(a.date), now)).length;
  const lastMonthApartados = activeApps.filter(a => a.status === 'Apartado' && isSameMonth(parseISO(a.date), lastMonth)).length;

  const currentMonthCommission = activeApps
    .filter(a => (a.status === 'Cierre' || a.status === 'Apartado') && isSameMonth(parseISO(a.date), now))
    .reduce((sum, a) => sum + (a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100), 0);

  const currentMonthPaidCommission = activeApps
    .filter(a => (a.status === 'Cierre' || a.status === 'Apartado') && a.commissionStatus === 'Pagada' && isSameMonth(parseISO(a.date), now))
    .reduce((sum, a) => sum + (a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100), 0);

  const lastMonthCommission = activeApps
    .filter(a => (a.status === 'Cierre' || a.status === 'Apartado') && isSameMonth(parseISO(a.date), lastMonth))
    .reduce((sum, a) => sum + (a.finalCreditAmount || 0) * 0.007 * ((a.commissionPercent || 0) / 100), 0);

  const todayTotal = activeApps.filter(a => isToday(parseISO(a.date))).length;
  const todayConfirmed = activeApps.filter(a => isToday(parseISO(a.date)) && a.isConfirmed).length;
  const tomorrowTotal = activeApps.filter(a => {
    const d = parseISO(a.date);
    const tomorrow = addDays(now, 1);
    return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
  }).length;

  const conversionRate = currentMonthProspects > 0 ? (currentMonthSales / currentMonthProspects) * 100 : 0;
  const lastMonthConversionRate = lastMonthProspects > 0 ? (lastMonthSales / lastMonthProspects) * 100 : 0;

  return {
    todayCount: todayTotal,
    todayConfirmed,
    tomorrowTotal,
    pendingCount: activeApps.filter(a => {
      const d = startOfDay(parseISO(a.date));
      return (isToday(d) || isAfter(d, startOfDay(now))) && !a.status;
    }).length,
    currentMonthProspects,
    lastMonthProspects,
    currentMonthSales,
    lastMonthSales,
    currentMonthOnlyCierre,
    lastMonthOnlyCierre,
    currentMonthApartados,
    lastMonthApartados,
    currentMonthCommission,
    lastMonthCommission,
    currentMonthPaidCommission,
    conversionRate: parseFloat(conversionRate.toFixed(1)),
    lastMonthConversionRate: parseFloat(lastMonthConversionRate.toFixed(1)),
  };
};
