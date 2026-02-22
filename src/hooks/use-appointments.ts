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
  | 'Apartado';

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
}

const STORAGE_KEY = 'olivares_fin_data_v4';

const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'cierre', 'seguimiento'];
  const statuses: AppointmentStatus[] = ['Asistencia', 'No asistencia', 'Continuación en otra cita', 'Reagendó', 'Reembolso', 'Apartado'];
  const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 'Elena Sánchez', 'Roberto Díaz', 'Sofía Castro'];

  for (let i = 0; i < 50; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const pastDate = subDays(new Date(), Math.floor(Math.random() * 60) + 1);
    
    data.push({
      id: uuidv4(),
      name: `${randomName} ${i + 1}`,
      phone: `55 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: pastDate.toISOString(),
      time: `${Math.floor(9 + Math.random() * 8).toString().padStart(2, '0')}:00`,
      type: randomType,
      status: randomStatus,
      notes: "Cliente interesado en crédito tradicional."
    });
  }

  for (let i = 0; i < 10; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    let futureDate;
    if (i < 3) futureDate = new Date(); 
    else if (i < 6) futureDate = addDays(new Date(), 1); 
    else futureDate = addDays(new Date(), Math.floor(Math.random() * 7) + 2);

    data.push({
      id: uuidv4(),
      name: `${randomName} Futuro ${i + 1}`,
      phone: `55 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: futureDate.toISOString(),
      time: `${Math.floor(9 + Math.random() * 8).toString().padStart(2, '0')}:30`,
      type: randomType,
      notes: ""
    });
  }

  return data;
};

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch (e) {
        setAppointments(generateSeedData());
      }
    } else {
      setAppointments(generateSeedData());
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  }, [appointments, isLoaded]);

  const addAppointment = (newApp: Omit<Appointment, 'id'>) => {
    setAppointments(prev => [{ ...newApp, id: uuidv4() }, ...prev]);
  };

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  const editAppointment = (id: string, updatedData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, ...updatedData } : app));
  };

  const now = new Date();
  const startOfToday = startOfDay(now);
  const lastMonth = subMonths(now, 1);

  const upcoming = appointments
    .filter(app => {
      const appDate = startOfDay(parseISO(app.date));
      return (isAfter(appDate, startOfToday) || (isToday(appDate) && !app.status)) && !app.status;
    })
    .sort((a, b) => {
      const timeA = parseISO(a.date).getTime();
      const timeB = parseISO(b.date).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return a.time.localeCompare(b.time);
    });

  const past = appointments
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
    const today = startOfDay(new Date());
    const dayOfApp = startOfDay(d);
    
    if (isToday(dayOfApp)) return "Hoy";
    if (isTomorrow(dayOfApp)) return "Mañana";
    
    const diffDays = differenceInDays(dayOfApp, today);
    if (diffDays === 2) return "Pasado mañana";

    // Past dates
    const pastDiffDays = differenceInDays(today, dayOfApp);
    if (pastDiffDays === 1) return "Ayer";
    if (pastDiffDays === 2) return "Antier";
    
    if (isThisWeek(dayOfApp, { locale: es })) {
      return format(dayOfApp, 'EEEE', { locale: es }).charAt(0).toUpperCase() + format(dayOfApp, 'EEEE', { locale: es }).slice(1);
    }

    if (pastDiffDays > 2 && pastDiffDays <= 7) {
      return `${format(dayOfApp, 'EEEE', { locale: es })} pasado`;
    }

    if (pastDiffDays > 7 && pastDiffDays <= 14) {
      return "Semana pasada";
    }

    if (pastDiffDays > 14 && pastDiffDays <= 21) {
      return "Semana antepasada";
    }

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
    todayCount: appointments.filter(app => isToday(parseISO(app.date))).length,
    pendingCount: upcoming.length,
    
    currentMonthProspects: appointments.filter(app => isSameMonth(parseISO(app.date), now)).length,
    lastMonthProspects: appointments.filter(app => isSameMonth(parseISO(app.date), lastMonth)).length,

    currentMonthSales: appointments.filter(app => app.status === 'Apartado' && isSameMonth(parseISO(app.date), now)).length,
    lastMonthSales: appointments.filter(app => app.status === 'Apartado' && isSameMonth(parseISO(app.date), lastMonth)).length,
  };

  return { 
    upcoming, 
    past, 
    appointments, 
    addAppointment, 
    updateStatus, 
    deleteAppointment,
    editAppointment,
    formatFriendlyDate,
    format12hTime,
    stats, 
    isLoaded 
  };
}
