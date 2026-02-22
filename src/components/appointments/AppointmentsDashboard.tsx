"use client"

import React, { useState, useMemo } from 'react';
import AppointmentForm from './AppointmentForm';
import UpcomingAppointments from './UpcomingAppointments';
import PastAppointments from './PastAppointments';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CalendarClock, Search } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';

interface AppointmentsDashboardProps {
  appointments: Appointment[];
  upcoming: Appointment[];
  past: Appointment[];
  addAppointment: (newApp: Omit<Appointment, 'id'>) => void;
  updateStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  editAppointment: (id: string, updatedData: Partial<Appointment>) => void;
  formatFriendlyDate: (date: string) => string;
}

export default function AppointmentsDashboard({
  appointments,
  upcoming,
  past,
  addAppointment,
  updateStatus,
  deleteAppointment,
  editAppointment,
  formatFriendlyDate
}: AppointmentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  const filterAppointments = (list: Appointment[]) => {
    if (!searchTerm) return list;
    const s = searchTerm.toLowerCase();
    return list.filter(app => 
      app.name.toLowerCase().includes(s) || 
      app.phone.includes(s) || 
      app.type.toLowerCase().includes(s) ||
      (app.status && app.status.toLowerCase().includes(s))
    );
  };

  const filteredUpcoming = useMemo(() => filterAppointments(upcoming), [upcoming, searchTerm]);
  const filteredPast = useMemo(() => filterAppointments(past), [past, searchTerm]);

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
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prospecto..."
                className="pl-9 h-9 bg-muted/30 border-border/50 focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upcoming">Próximas ({filteredUpcoming.length})</TabsTrigger>
                <TabsTrigger value="past">Pasadas ({filteredPast.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <UpcomingAppointments 
                  appointments={filteredUpcoming} 
                  formatDate={formatFriendlyDate}
                  onSelect={setSelectedApp}
                  updateStatus={updateStatus}
                />
              </TabsContent>
              <TabsContent value="past">
                <PastAppointments 
                  appointments={filteredPast} 
                  onSelect={setSelectedApp}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AppointmentDetailsDialog 
        appointment={selectedApp} 
        open={!!selectedApp} 
        onOpenChange={(open) => !open && setSelectedApp(null)}
        onDelete={deleteAppointment}
        onEdit={editAppointment}
      />
    </div>
  );
}
