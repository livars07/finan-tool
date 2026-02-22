
"use client"

import { useState, useEffect } from 'react';
import { isAfter, isBefore, isToday, isTomorrow, isThisWeek, format, parseISO, startOfDay, subDays, addDays, isSameMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

export type AppointmentStatus = 'Reagendó' | 'Canceló' | 'Venta' | 'Cita Exitosa';
export type AppointmentType = '1ra consulta' | '2da consulta' | 'cierre' | 'seguimiento';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string; // ISO string
  time: string;
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
}

const STORAGE_KEY = 'olivares_fin_data_v3';

const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const types: AppointmentType[] = ['1ra consulta', '2da consulta', 'cierre', 'seguimiento'];
  const statuses: AppointmentStatus[] = ['Venta', 'Canceló', 'Reagendó', 'Cita Exitosa'];
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
      time: `${Math.floor(9 + Math.random() * 8)}:00`,
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
      time: `${Math.floor(9 + Math.random() * 8)}:30`,
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
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const past = appointments
    .filter(app => {
      const appDate = startOfDay(parseISO(app.date));
      return isBefore(appDate, startOfToday) || app.status;
    })
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const formatFriendlyDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    const today = new Date();
    if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) return "Hoy";
    if (isTomorrow(d)) return "Mañana";
    if (isThisWeek(d)) return format(d, 'EEEE', { locale: es });
    return format(d, 'dd/MM/yyyy');
  };

  const stats = {
    todayCount: appointments.filter(app => {
      const d = parseISO(app.date);
      const today = new Date();
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length,
    pendingCount: upcoming.length,
    
    currentMonthProspects: appointments.filter(app => isSameMonth(parseISO(app.date), now)).length,
    lastMonthProspects: appointments.filter(app => isSameMonth(parseISO(app.date), lastMonth)).length,

    currentMonthSales: appointments.filter(app => app.status === 'Venta' && isSameMonth(parseISO(app.date), now)).length,
    lastMonthSales: appointments.filter(app => app.status === 'Venta' && isSameMonth(parseISO(app.date), lastMonth)).length,
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
    stats, 
    isLoaded 
  };
}
