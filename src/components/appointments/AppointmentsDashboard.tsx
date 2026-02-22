"use client"

import React from 'react';
import AppointmentForm from './AppointmentForm';
import UpcomingAppointments from './UpcomingAppointments';
import PastAppointments from './PastAppointments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock } from 'lucide-react';
import { Appointment, AppointmentStatus, AppointmentType } from '@/hooks/use-appointments';

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
  upcoming,
  past,
  addAppointment,
  updateStatus,
  deleteAppointment,
  editAppointment,
  formatFriendlyDate
}: AppointmentsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <AppointmentForm onAdd={addAppointment} />

        <Card className="shadow-2xl bg-card border-border border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="text-primary w-6 h-6" />
              <CardTitle className="text-xl font-headline font-semibold">Gestión de Citas</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Monitoreo de prospectos y cierres</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
                <TabsTrigger value="past">Pasadas ({past.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <UpcomingAppointments 
                  appointments={upcoming} 
                  formatDate={formatFriendlyDate}
                  deleteAppointment={deleteAppointment}
                  editAppointment={editAppointment}
                />
              </TabsContent>
              <TabsContent value="past">
                <PastAppointments 
                  appointments={past} 
                  updateStatus={updateStatus}
                  deleteAppointment={deleteAppointment}
                  editAppointment={editAppointment}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
