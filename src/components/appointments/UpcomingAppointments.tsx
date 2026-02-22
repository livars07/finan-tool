"use client"

import React from 'react';
import { Appointment } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, Calendar } from "lucide-react";

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
            <TableHead>Número</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((app) => (
            <TableRow key={app.id} className="hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">{app.name}</TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {app.phone || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {formatDate(app.date)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-accent">
                  <Clock className="w-3 h-3" /> {app.time}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}