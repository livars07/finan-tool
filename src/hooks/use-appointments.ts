"use client"

import { useState, useEffect } from 'react';
import { isAfter, isBefore, isToday, isTomorrow, isThisWeek, format, parseISO, startOfDay, subDays, addDays, isSameMonth, subMonths, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

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
  date: string; // ISO string
  time: string; // "HH:mm" (24h internal format)
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  isConfirmed?: boolean;
  isArchived?: boolean;
}

const STORAGE_KEY = 'olivares_fin_data_v4';

const formatPhoneNumber = (phone: string) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};

const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'cierre', 'seguimiento'];
  const statuses: AppointmentStatus[] = ['Asistencia', 'No asistencia', 'Continuación en otra cita', 'Reagendó', 'Reembolso', 'Cierre'];
  const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 'Elena Sánchez', 'Roberto Díaz', 'Sofía Castro'];

  for (let i = 0; i < 50; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const pastDate = subDays(new Date(), Math.floor(Math.random() * 30)); // Más concentrado en el mes actual para demos
    
    data.push({
      id: uuidv4(),
      name: `${randomName} ${i + 1}`,
      phone: formatPhoneNumber(`55${Math.floor(10000000 + Math.random() * 90000000)}`),
      date: pastDate.toISOString(),
      time: `${Math.floor(9 + Math.random() * 8).toString().padStart(2, '0')}:00`,
      type: randomType,
      status: randomStatus,
      notes: "Cliente interesado en crédito tradicional.",
      isConfirmed: true,
      isArchived: false
    });
  }

  for (let i = 0; i < 15; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    let futureDate;
    if (i < 5) futureDate = new Date(); 
    else if (i < 10) futureDate = addDays(new Date(), 1); 
    else futureDate = addDays(new Date(), Math.floor(Math.random() * 14) + 2);

    data.push({
      id: uuidv4(),
      name: `${randomName} Futuro ${i + 1}`,
      phone: formatPhoneNumber(`55${Math.floor(10000000 + Math.random() * 90000000)}`),
      date: futureDate.toISOString(),
      time: `${Math.floor(9 + Math.random() * 8).toString().padStart(2, '0')}:30`,
      type: randomType,
      notes: "",
      isArchived: false
    });
  }

  return data;
};

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Función para guardar forzadamente en disco
  const saveToDisk = (data: Appointment[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch (e) {
        const seed = generateSeedData();
        setAppointments(seed);
        saveToDisk(seed);
      }
    } else {
      const seed = generateSeedData();
      setAppointments(seed);
      saveToDisk(seed);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToDisk(appointments);
    }
  }, [appointments, isLoaded]);

  const addAppointment = (newApp: Omit<Appointment, 'id' | 'isArchived'>) => {
    const formattedApp: Appointment = {
      ...newApp,
      id: uuidv4(),
      phone: formatPhoneNumber(newApp.phone),
      isArchived: false
    };
    setAppointments(prev => {
      const updated = [formattedApp, ...prev];
      saveToDisk(updated);
      return updated;
    });
  };

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => {
      const updated = prev.map(app => app.id === id ? { ...app, status } : app);
      saveToDisk(updated);
      return updated;
    });
  };

  const archiveAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.map(app => app.id === id ? { ...app, isArchived: true } : app);
      saveToDisk(updated);
      return updated;
    });
  };

  const restoreAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.map(app => app.id === id ? { ...app, isArchived: false } : app);
      saveToDisk(updated);
      return updated;
    });
  };

  const permanentlyDeleteAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.filter(app => app.id !== id);
      saveToDisk(updated);
      return updated;
    });
  };

  const editAppointment = (id: string, updatedData: Partial<Appointment>) => {
    setAppointments(prev => {
      const dataToUpdate = { ...updatedData };
      if (dataToUpdate.phone) dataToUpdate.phone = formatPhoneNumber(dataToUpdate.phone);
      const updated = prev.map(app => app.id === id ? { ...app, ...dataToUpdate } : app);
      saveToDisk(updated);
      return updated;
    });
  };

  const toggleConfirmation = (id: string) => {
    setAppointments(prev => {
      const updated = prev.map(app => app.id === id ? { ...app, isConfirmed: true } : app);
      saveToDisk(updated);
      return updated;
    });
  };

  const resetData = () => {
    const seed = generateSeedData();
    setAppointments(seed);
    saveToDisk(seed);
  };

  const now = new Date();
  const startOfToday = startOfDay(now);
  const lastMonth = subMonths(now, 1);

  const activeAppointments = appointments.filter(app => !app.isArchived);
  const archived = appointments.filter(app => app.isArchived === true);

  const upcoming = activeAppointments
    .filter(app => {
      const appDate = startOfDay(parseISO(app.date));
      return (isToday(appDate) || isAfter(appDate, startOfToday)) && !app.status;
    })
    .sort((a, b) => {
      const timeA = parseISO(a.date).getTime();
      const timeB = parseISO(b.date).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return a.time.localeCompare(b.time);
    });

  const past = activeAppointments
    .filter(app => {
      const appDate = startOfDay(parseISO(app.date));
      return isBefore(appDate, startOfToday) || app.status;
    })
    .sort((a, b) => {
      const timeA = parseISO(a.date).getTime();
      const timeB = parseISO(b.date).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return b.time.localeCompare(a.time);
    });

  const formatFriendlyDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    const dayOfApp = startOfDay(d);
    if (isToday(dayOfApp)) return "Hoy";
    if (isTomorrow(dayOfApp)) return "Mañana";
    const pastDiffDays = differenceInDays(startOfDay(new Date()), dayOfApp);
    if (pastDiffDays === 1) return "Ayer";
    return format(d, 'dd/MM/yyyy');
  };

  const format12hTime = (time24h: string) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const stats = {
    todayCount: activeAppointments.filter(app => isToday(parseISO(app.date))).length,
    pendingCount: upcoming.length,
    archivedCount: archived.length,
    
    // CAMBIO: Ahora cuenta todas las citas activas del mes actual Y citas futuras de cualquier mes
    currentMonthProspects: activeAppointments.filter(app => {
      const appDate = parseISO(app.date);
      return isSameMonth(appDate, now) || isAfter(appDate, now);
    }).length,

    lastMonthProspects: activeAppointments.filter(app => isSameMonth(parseISO(app.date), lastMonth)).length,

    currentMonthSales: activeAppointments.filter(app => app.status === 'Cierre' && isSameMonth(parseISO(app.date), now)).length,
    lastMonthSales: activeAppointments.filter(app => app.status === 'Cierre' && isSameMonth(parseISO(app.date), lastMonth)).length,
  };

  return { 
    upcoming, 
    past, 
    archived,
    appointments, 
    addAppointment, 
    updateStatus, 
    archiveAppointment,
    restoreAppointment,
    permanentlyDeleteAppointment,
    editAppointment,
    toggleConfirmation,
    resetData,
    formatFriendlyDate,
    format12hTime,
    stats, 
    isLoaded 
  };
}
