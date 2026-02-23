"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, ChevronDown } from "lucide-react";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Props {
  appointments: Appointment[];
  onSelect: (app: Appointment) => void;
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  highlightedId?: string | null;
}

export default function PastAppointments({ appointments, onSelect, formatDate, format12hTime, highlightedId }: Props) {
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
      case 'Cierre': return 'text-green-400 font-bold';
      case 'No asistencia': return 'text-destructive';
      case 'Reagendó': return 'text-primary';
      case 'Asistencia': return 'text-accent';
      case 'Reembolso': return 'text-orange-400';
      case 'Continuación en otra cita': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const visibleAppointments = appointments.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden bg-card/10 relative backdrop-blur-sm">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead>Nombre / Teléfono</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAppointments.map((app) => {
                const isHighlighted = highlightedId === app.id;
                return (
                  <TableRow 
                    key={app.id} 
                    onClick={() => onSelect(app)}
                    className={cn(
                      "hover:bg-primary/10 transition-colors cursor-pointer relative",
                      isHighlighted && "bg-accent/20 animate-pulse border-2 border-accent/40 z-20"
                    )}
                  >
                    <TableCell>
                      <div className="font-medium text-sm">{app.name}</div>
                      <div className="text-xs text-muted-foreground">{app.phone}</div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground uppercase tracking-tight">
                      {app.type}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] uppercase font-medium">
                      {formatDate(app.date)} {format12hTime(app.time)}
                    </TableCell>
                    <TableCell className={cn("text-[10px] uppercase font-bold", getStatusColor(app.status))}>
                      {app.status || 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {visibleCount < appointments.length && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setVisibleCount(p => p + 20)}
            className="text-xs border-dashed hover:bg-primary/10 backdrop-blur-md"
          >
            <ChevronDown className="mr-2 h-3 w-3" /> Cargar 20 más
          </Button>
        </div>
      )}
    </div>
  );
}