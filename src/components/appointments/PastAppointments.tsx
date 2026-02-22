
"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ChevronDown, ListFilter } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  appointments: Appointment[];
  updateStatus: (id: string, status: AppointmentStatus) => void;
}

export default function PastAppointments({ appointments, updateStatus }: Props) {
  const [visibleCount, setVisibleCount] = useState(20);

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

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  const visibleAppointments = appointments.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden bg-card">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead>Nombre / Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAppointments.map((app) => (
                <TableRow key={app.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-sm">{app.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{app.type}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(parseISO(app.date), 'dd/MM/yyyy')} {app.time}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={app.status || 'Cita Exitosa'}
                      onValueChange={(val) => updateStatus(app.id, val as AppointmentStatus)}
                    >
                      <SelectTrigger className={`w-[140px] h-7 text-xs bg-transparent border-border/50 ${getStatusColor(app.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reagendó">Reagendó</SelectItem>
                        <SelectItem value="Canceló">Canceló</SelectItem>
                        <SelectItem value="Venta">Venta</SelectItem>
                        <SelectItem value="Cita Exitosa">Cita Exitosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {visibleCount < appointments.length && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLoadMore}
            className="text-xs border-dashed hover:bg-primary/10"
          >
            <ChevronDown className="mr-2 h-3 w-3" /> Cargar 20 más ({appointments.length - visibleCount} restantes)
          </Button>
        </div>
      )}
      
      <div className="text-[10px] text-muted-foreground text-center">
        Mostrando {visibleAppointments.length} de {appointments.length} registros históricos
      </div>
    </div>
  );
}
