
"use client"

import React from 'react';
import { Appointment } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, Calendar, Info } from "lucide-react";
import { isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  appointments: Appointment[];
  formatDate: (date: string) => string;
}

export default function UpcomingAppointments({ appointments, formatDate }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <Calendar className="w-12 h-12 mb-2 opacity-20" />
        <p>No hay citas programadas.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((app) => {
            const isAppToday = isToday(parseISO(app.date));
            return (
              <TableRow 
                key={app.id} 
                className={cn(
                  "hover:bg-primary/5 transition-colors",
                  isAppToday && "bg-primary/10 border-l-4 border-l-primary"
                )}
              >
                <TableCell className="font-medium">
                  {app.name}
                  {isAppToday && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase animate-pulse">
                      Hoy
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Info className="w-3 h-3" /> {app.type}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={isAppToday ? "default" : "secondary"} className="font-normal">
                    {formatDate(app.date)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-accent font-bold">
                    <Clock className="w-3 h-3" /> {app.time}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
