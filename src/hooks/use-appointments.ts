"use client"

import { useState, useEffect } from 'react';
import { isAfter, isBefore, isToday, isTomorrow, isThisWeek, format, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export type AppointmentStatus = 'Reagendó' | 'Canceló' | 'Venta' | 'Cita Exitosa' | 'Cita Exitosa y reagendó';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string; // ISO string
  time: string;
  status?: AppointmentStatus;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', name: 'Juan Perez', phone: '555-123-4567', date: new Date().toISOString(), time: '10:00', status: 'Venta' },
  { id: '2', name: 'Maria Lopez', phone: '555-987-6543', date: new Date(Date.now() + 86400000).toISOString(), time: '15:30' },
  { id: '3', name: 'Carlos Gomez', phone: '555-456-7890', date: new Date(Date.now() - 86400000).toISOString(), time: '09:00', status: 'Reagendó' },
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

  const addAppointment = (newApp: Omit<Appointment, 'id'>) => {
    setAppointments(prev => [...prev, { ...newApp, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
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

  return { upcoming, past, addAppointment, updateStatus, formatFriendlyDate };
}