
"use client"

import { useState, useEffect } from 'react';
import { isAfter, isBefore, isToday, isTomorrow, isThisWeek, format, parseISO, startOfDay, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export type AppointmentStatus = 'Reagendó' | 'Canceló' | 'Venta' | 'Cita Exitosa' | 'Cita Exitosa y reagendó';
export type AppointmentType = '1er consulta' | '2da consulta' | 'cierre' | 'asesoria post-venta';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string; // ISO string
  time: string;
  type: AppointmentType;
  status?: AppointmentStatus;
}

const STORAGE_KEY = 'olivares_fin_data_v2';

const generateSeedData = (): Appointment[] => {
  const data: Appointment[] = [];
  const types: AppointmentType[] = ['1er consulta', '2da consulta', 'cierre', 'asesoria post-venta'];
  const statuses: AppointmentStatus[] = ['Venta', 'Canceló', 'Reagendó', 'Cita Exitosa'];
  const names = ['Juan Perez', 'Maria Garcia', 'Carlos Lopez', 'Ana Martinez', 'Luis Rodriguez', 'Elena Sanchez', 'Roberto Diaz', 'Sofia Castro'];

  for (let i = 0; i < 50; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const pastDate = subDays(new Date(), Math.floor(Math.random() * 30) + 1);
    
    data.push({
      id: `past-${i}`,
      name: `${randomName} ${i + 1}`,
      phone: `55 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: pastDate.toISOString(),
      time: `${Math.floor(9 + Math.random() * 8)}:00`,
      type: randomType,
      status: randomStatus
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
      id: `future-${i}`,
      name: `${randomName} Futuro ${i + 1}`,
      phone: `55 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: futureDate.toISOString(),
      time: `${Math.floor(9 + Math.random() * 8)}:30`,
      type: randomType
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
    setAppointments(prev => [{ ...newApp, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
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

  const now = startOfDay(new Date());

  const upcoming = appointments
    .filter(app => {
      const appDate = startOfDay(parseISO(app.date));
      return isAfter(appDate, now) || isToday(appDate);
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const past = appointments
    .filter(app => {
      const appDate = startOfDay(parseISO(app.date));
      return isBefore(appDate, now) && !isToday(appDate);
    })
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const formatFriendlyDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Hoy";
    if (isTomorrow(d)) return "Mañana";
    if (isThisWeek(d)) return format(d, 'EEEE', { locale: es });
    return format(d, 'dd/MM/yyyy');
  };

  const stats = {
    todayCount: appointments.filter(app => isToday(parseISO(app.date))).length,
    totalProspects: appointments.length,
    salesCount: appointments.filter(app => app.status === 'Venta').length,
    pendingCount: upcoming.length
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
