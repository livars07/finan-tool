"use client"

import React, { useState, useMemo } from 'react';
import AppointmentForm from './AppointmentForm';
import UpcomingAppointments from './UpcomingAppointments';
import PastAppointments from './PastAppointments';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import TrashDialog from './TrashDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarClock, Search, Trash2 } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { parseISO, format, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentsDashboardProps {
  appointments: Appointment[];
  upcoming: Appointment[];
  past: Appointment[];
  archived: Appointment[];
  addAppointment: (newApp: Omit<Appointment, 'id' | 'isArchived'>) => void;
  updateStatus: (id: string, status: AppointmentStatus) => void;
  archiveAppointment: (id: string) => void;
  restoreAppointment: (id: string) => void;
  permanentlyDeleteAppointment: (id: string) => void;
  editAppointment: (id: string, updatedData: Partial<Appointment>) => void;
  toggleConfirmation: (id: string) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
}

export default function AppointmentsDashboard({
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
  formatFriendlyDate,
  format12hTime
}: AppointmentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const normalizeStr = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const filterAppointments = (list: Appointment[]) => {
    if (!searchTerm) return list;
    const s = normalizeStr(searchTerm);
    
    return list.filter(app => {
      const appDate = parseISO(app.date);
      const friendlyDate = normalizeStr(formatFriendlyDate(app.date));
      const monthName = normalizeStr(format(appDate, 'MMMM', { locale: es }));
      const dayName = normalizeStr(format(appDate, 'EEEE', { locale: es }));
      const dayNum = format(appDate, 'd');
      const fullDate = normalizeStr(format(appDate, "d 'de' MMMM", { locale: es }));
      
      const basicMatch = 
        normalizeStr(app.name).includes(s) || 
        app.phone.includes(s) || 
        (app.status && normalizeStr(app.status).includes(s));
      
      if (basicMatch) return true;
      if (friendlyDate.includes(s)) return true;
      if (monthName.includes(s)) return true;
      if (dayName.includes(s)) return true;
      if (fullDate.includes(s)) return true;

      if (s === 'fin de semana' || s === 'finde') {
        if (isWeekend(appDate)) return true;
      }

      const terms = s.split(/\s+/);
      if (terms.length > 1) {
        return terms.every(term => 
          friendlyDate.includes(term) || 
          monthName.includes(term) || 
          dayName.includes(term) || 
          dayNum === term ||
          normalizeStr(app.name).includes(term)
        );
      }

      return false;
    });
  };

  const filteredUpcoming = useMemo(() => filterAppointments(upcoming), [upcoming, searchTerm]);
  const filteredPast = useMemo(() => filterAppointments(past), [past, searchTerm]);

  const selectedApp = useMemo(() => {
    return appointments.find(app => app.id === selectedAppId) || null;
  }, [appointments, selectedAppId]);

  const handleOpenChange = (open: boolean) => {
    if (!open && selectedAppId) {
      setHighlightedId(selectedAppId);
      setTimeout(() => setHighlightedId(null), 4000);
    }
    if (!open) setSelectedAppId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <AppointmentForm onAdd={addAppointment} />

        <Card className="shadow-2xl bg-card border-border border-l-4 border-l-primary">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarClock className="text-primary w-6 h-6" />
                <CardTitle className="text-xl font-headline font-semibold">Gestión de citas</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">Monitoreo de prospectos y cierres</CardDescription>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busca por nombre, tel, mes o día..."
                className="pl-9 h-9 bg-muted/30 border-border/50 focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upcoming">Próximas ({filteredUpcoming.length})</TabsTrigger>
                <TabsTrigger value="past">Pasadas ({filteredPast.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <UpcomingAppointments 
                  appointments={filteredUpcoming} 
                  formatDate={formatFriendlyDate}
                  format12hTime={format12hTime}
                  onSelect={(app) => setSelectedAppId(app.id)}
                  updateStatus={updateStatus}
                  toggleConfirmation={toggleConfirmation}
                  highlightedId={highlightedId}
                />
              </TabsContent>
              <TabsContent value="past">
                <PastAppointments 
                  appointments={filteredPast} 
                  formatDate={formatFriendlyDate}
                  format12hTime={format12hTime}
                  onSelect={(app) => setSelectedAppId(app.id)}
                  highlightedId={highlightedId}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-center pt-2 border-t border-border/40">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsTrashOpen(true)}
                className="text-muted-foreground hover:text-primary group"
              >
                <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Papelera ({archived.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentDetailsDialog 
        appointment={selectedApp} 
        open={!!selectedAppId} 
        onOpenChange={handleOpenChange}
        onDelete={archiveAppointment}
        onEdit={editAppointment}
        formatFriendlyDate={formatFriendlyDate}
        format12hTime={format12hTime}
      />

      <TrashDialog 
        open={isTrashOpen}
        onOpenChange={setIsTrashOpen}
        archivedAppointments={archived}
        onRestore={restoreAppointment}
        onDelete={permanentlyDeleteAppointment}
        formatDate={formatFriendlyDate}
        format12hTime={format12hTime}
      />
    </div>
  );
}
