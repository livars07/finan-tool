"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import FollowUpDialog from './FollowUpDialog';

interface Props {
  appointments: Appointment[];
  updateStatus: (id: string, status: AppointmentStatus) => void;
}

export default function PastAppointments({ appointments, updateStatus }: Props) {
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
        <p>No hay registro de citas pasadas.</p>
      </div>
    );
  }

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status) {
      case 'Venta': return 'text-green-400 font-bold';
      case 'Canceló': return 'text-destructive';
      case 'Reagendó': return 'text-primary';
      case 'Cita Exitosa': return 'text-accent';
      default: return '';
    }
  };

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(parseISO(app.date), 'dd/MM/yyyy')} {app.time}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={app.status || 'Cita Exitosa'}
                    onValueChange={(val) => updateStatus(app.id, val as AppointmentStatus)}
                  >
                    <SelectTrigger className={`w-[180px] h-8 bg-transparent border-border/50 ${getStatusColor(app.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reagendó">Reagendó</SelectItem>
                      <SelectItem value="Canceló">Canceló</SelectItem>
                      <SelectItem value="Venta">Venta</SelectItem>
                      <SelectItem value="Cita Exitosa">Cita Exitosa</SelectItem>
                      <SelectItem value="Cita Exitosa y reagendó">Exitosa & Reagendó</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent hover:text-accent hover:bg-accent/10"
                    onClick={() => setSelectedApp(app)}
                  >
                    <Sparkles className="mr-1 h-3 w-3" /> Seguimiento
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FollowUpDialog
        appointment={selectedApp}
        open={!!selectedApp}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      />
    </>
  );
}