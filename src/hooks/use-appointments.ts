"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  isToday, 
  isAfter, 
  isBefore, 
  startOfDay, 
  parseISO, 
  isTomorrow, 
  format, 
  differenceInDays 
} from 'date-fns';
import * as Service from '@/services/appointment-service';
import { Appointment, AppointmentStatus, AppointmentType } from '@/services/appointment-service';

/**
 * Hook useAppointments
 * 
 * Este hook es el puente entre los componentes de React y nuestro Servicio de Datos.
 * Se encarga de que React se entere cuando los datos cambian para redibujar la pantalla.
 */
export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Al iniciar la app, cargamos lo que hay en el disco
  useEffect(() => {
    const saved = Service.getFromDisk();
    if (saved.length > 0) {
      setAppointments(saved);
    } else {
      // Si no hay nada, creamos datos de prueba
      const seed = Service.generateSeedData();
      setAppointments(seed);
    }
    setIsLoaded(true);
  }, []);

  // --- ACCIONES (Que llaman al servicio y actualizan el estado de React) ---

  const addAppointment = (data: Omit<Appointment, 'id' | 'isArchived'>) => {
    const updated = Service.createAppointment(data);
    setAppointments(updated);
  };

  const updateStatus = (id: string, status: AppointmentStatus) => {
    const updated = Service.updateAppointment(id, { status });
    setAppointments(updated);
  };

  const archiveAppointment = (id: string) => {
    // El "archivado" es simplemente poner isArchived en true
    const updated = Service.updateAppointment(id, { isArchived: true });
    setAppointments(updated);
  };

  const restoreAppointment = (id: string) => {
    const updated = Service.updateAppointment(id, { isArchived: false });
    setAppointments(updated);
  };

  const permanentlyDeleteAppointment = (id: string) => {
    const updated = Service.deletePermanently(id);
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

  // --- FILTRADO DE LISTAS (Para saber qué mostrar en cada pestaña) ---

  const activeAppointments = useMemo(() => appointments.filter(a => !a.isArchived), [appointments]);
  const archived = useMemo(() => appointments.filter(a => a.isArchived), [appointments]);

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return activeAppointments
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
  }, [activeAppointments]);

  const past = useMemo(() => {
    const today = startOfDay(new Date());
    return activeAppointments
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
  }, [activeAppointments]);

  // --- HELPERS VISUALES ---

  const formatFriendlyDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    const day = startOfDay(d);
    if (isToday(day)) return "Hoy";
    if (isTomorrow(day)) return "Mañana";
    if (differenceInDays(startOfDay(new Date()), day) === 1) return "Ayer";
    return format(d, 'dd/MM/yyyy');
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
    appointments,
    upcoming,
    past,
    archived,
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

// Re-exportamos tipos para conveniencia de los componentes
export type { Appointment, AppointmentStatus, AppointmentType };
