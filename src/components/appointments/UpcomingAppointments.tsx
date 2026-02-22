"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Info, CheckCircle2 } from "lucide-react";
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppointments } from '@/hooks/use-appointments';

interface Props {
  appointments: Appointment[];
  formatDate: (date: string) => string;
  onSelect: (app: Appointment) => void;
  updateStatus: (id: string, status: AppointmentStatus) => void;
  highlightedId?: string | null;
}

export default function UpcomingAppointments({ appointments, formatDate, onSelect, updateStatus, highlightedId }: Props) {
  const [finId, setFinId] = useState<string | null>(null);
  const [status, setStatus] = useState<AppointmentStatus>('Asistencia');
  const { format12hTime } = useAppointments();

  const isActuallyToday = (dateStr: string) => {
    const d = parseISO(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <Calendar className="w-12 h-12 mb-2 opacity-20" />
        <p>No hay citas programadas.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden relative">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nombre / Teléfono</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((app) => {
            const appToday = isActuallyToday(app.date);
            const isHighlighted = highlightedId === app.id;
            
            return (
              <TableRow 
                key={app.id} 
                onClick={() => onSelect(app)}
                className={cn(
                  "hover:bg-primary/10 transition-colors cursor-pointer group relative",
                  appToday && "bg-primary/5 border-l-4 border-l-primary",
                  isHighlighted && "bg-accent/20 animate-pulse border-2 border-accent/40"
                )}
              >
                <TableCell>
                  <div className="font-medium text-sm">
                    {app.name}
                    {appToday && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase animate-pulse">
                        Hoy
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{app.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Info className="w-3 h-3" /> {app.type}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={appToday ? "default" : "secondary"} className="font-normal">
                    {formatDate(app.date)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-accent font-bold">
                    <Clock className="w-3 h-3" /> {format12hTime(app.time)}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {appToday && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/20"
                      onClick={() => setFinId(app.id)}
                      title="Finalizar cita"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!finId} onOpenChange={() => setFinId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Finalizar cita de hoy</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Selecciona el resultado de la reunión para moverla al historial.</p>
            <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asistencia">Asistencia</SelectItem>
                <SelectItem value="No asistencia">No asistencia</SelectItem>
                <SelectItem value="Continuación en otra cita">Continuación en otra cita</SelectItem>
                <SelectItem value="Reagendó">Reagendó</SelectItem>
                <SelectItem value="Reembolso">Reembolso</SelectItem>
                <SelectItem value="Apartado">Apartado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinId(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (finId) {
                updateStatus(finId, status);
                setFinId(null);
              }
            }}>Confirmar y Archivar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}