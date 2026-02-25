
"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  isToday, isAfter, isBefore, startOfDay, parseISO, 
  format, differenceInDays, isSameMonth, isSameYear, subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import * as Service from '@/services/appointment-service';
import { Appointment, AppointmentStatus, AppointmentType } from '@/services/appointment-service';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = Service.getFromDisk();
    if (saved.length > 0) {
      setAppointments(saved);
    } else {
      const seed = Service.generateSeedData();
      setAppointments(seed);
    }
    setIsLoaded(true);
  }, []);

  const addAppointment = (data: Omit<Appointment, 'id'>) => {
    const updated = Service.createAppointment(data);
    setAppointments(updated);
  };

  const updateStatus = (id: string, status: AppointmentStatus, notes?: string) => {
    const app = appointments.find(a => a.id === id);
    
    const shouldAutoConfirm = app && !app.isConfirmed && status !== 'No asistencia' && status !== 'Reagendó';
    
    const updated = Service.updateAppointment(id, { 
      status, 
      notes,
      ...(shouldAutoConfirm ? { isConfirmed: true } : {})
    });
    setAppointments(updated);
  };

  const editAppointment = (id: string, data: Partial<Appointment>) => {
    const updated = Service.updateAppointment(id, data);
    setAppointments(updated);
  };

  const toggleConfirmation = (id: string) => {
    const updated = Service.updateAppointment(id, { isConfirmed: true });
    setAppointments(updated);
  };

  const resetData = () => {
    const seed = Service.generateSeedData();
    setAppointments(seed);
  };

  const clearAll = () => {
    Service.saveToDisk([]);
    setAppointments([]);
  };

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return appointments
      .filter(a => {
        const d = startOfDay(parseISO(a.date));
        return (isToday(d) || isAfter(d, today)) && !a.status;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date).getTime();
        const dateB = parseISO(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.time.localeCompare(b.time);
      });
  }, [appointments]);

  const past = useMemo(() => {
    const today = startOfDay(new Date());
    return appointments
      .filter(a => {
        const d = startOfDay(parseISO(a.date));
        return isBefore(d, today) || !!a.status;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date).getTime();
        const dateB = parseISO(b.date).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return b.time.localeCompare(a.time);
      });
  }, [appointments]);

  const formatFriendlyDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    const day = startOfDay(d);
    const today = startOfDay(new Date());
    const diff = differenceInDays(day, today);

    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    if (diff === -1) return "Ayer";

    // Regla de los 6 días: No usar "pasado" ni "este" si han pasado menos de 7 días
    if (Math.abs(diff) < 7) {
      const dayName = format(d, 'EEEE', { locale: es });
      return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }

    const f = format(d, "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
    return f.charAt(0).toUpperCase() + f.slice(1);
  };

  const format12hTime = (time24h: string) => {
    if (!time24h) return '';
    const [h, m] = time24h.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const stats = useMemo(() => Service.calculateStats(appointments), [appointments]);

  return {
    appointments, upcoming, past, addAppointment, updateStatus, editAppointment,
    toggleConfirmation, resetData, clearAll, formatFriendlyDate, format12hTime,
    stats, isLoaded
  };
}
