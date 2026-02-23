"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Calendar, Info, CheckCircle2, AlertCircle, CheckCircle } from "lucide-react";
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointments: Appointment[];
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  onSelect: (app: Appointment) => void;
  updateStatus: (id: string, status: AppointmentStatus, notes?: string) => void;
  toggleConfirmation: (id: string) => void;
  highlightedId?: string | null;
}

export default function UpcomingAppointments({ 
  appointments, 
  formatDate, 
  format12hTime, 
  onSelect, 
  updateStatus, 
  toggleConfirmation, 
  highlightedId 
}: Props) {
  const [finId, setFinId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [status, setStatus] = useState<AppointmentStatus>('Asistencia');
  const [finNotes, setFinNotes] = useState('');
  const { toast } = useToast();

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

  const handleConfirmAction = () => {
    if (confirmId) {
      const app = appointments.find(a => a.id === confirmId);
      toggleConfirmation(confirmId);
      setConfirmId(null);
      toast({
        title: "Asistencia Confirmada",
        description: `Se ha confirmado la asistencia de ${app?.name}.`,
      });
    }
  };

  const handleFinalize = () => {
    if (finId) {
      const app = appointments.find(a => a.id === finId);
      updateStatus(finId, status, finNotes);
      setFinId(null);
      setFinNotes('');
      toast({
        title: "Cita Finalizada",
        description: `${app?.name} movido al historial con resultado: ${status}.`,
      });
    }
  };

  const copyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${phone} se ha copiado al portapapeles.`,
      });
    });
  };

  return (
    <div className="border rounded-md overflow-hidden relative backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nombre / Teléfono</TableHead>
            <TableHead>Motivo</TableHead>
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
                  </div>
                  <div 
                    onClick={(e) => copyPhone(e, app.phone)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 group/phone"
                  >
                    {app.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">
                    <Info className="w-3 h-3" /> {app.type}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      appToday ? "text-primary" : "text-muted-foreground"
                    )}>
                      {formatDate(app.date)}
                    </span>
                    {appToday && (
                      <div onClick={(e) => e.stopPropagation()}>
                        {app.isConfirmed ? (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-green-400 uppercase tracking-tighter">
                            <CheckCircle className="w-2.5 h-2.5" /> Confirmada
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-5 px-1.5 text-[8px] font-bold uppercase border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 backdrop-blur-md"
                            onClick={() => setConfirmId(app.id)}
                          >
                            <AlertCircle className="w-2 h-2 mr-1" /> Sin confirmar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-accent font-bold text-[10px]">
                    <Clock className="w-3 h-3" /> {format12hTime(app.time)}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {appToday && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/20 backdrop-blur-md"
                      onClick={() => {
                        setFinId(app.id);
                        setFinNotes(app.notes || '');
                      }}
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
        <DialogContent className="sm:max-w-[500px] backdrop-blur-[20px] bg-card/10">
          <DialogHeader>
            <DialogTitle>Finalizar cita de hoy</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Selecciona el resultado y añade notas del cierre.</p>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Resultado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asistencia">Asistencia</SelectItem>
                  <SelectItem value="No asistencia">No asistencia</SelectItem>
                  <SelectItem value="Continuación en otra cita">Continuación en otra cita</SelectItem>
                  <SelectItem value="Reagendó">Reagendó</SelectItem>
                  <SelectItem value="Reembolso">Reembolso</SelectItem>
                  <SelectItem value="Cierre">Cierre</SelectItem>
                  <SelectItem value="Apartado">Apartado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Notas de Seguimiento</Label>
              <Textarea 
                placeholder="Escribe detalles importantes aquí..." 
                className="bg-muted/30 min-h-[150px] resize-none"
                value={finNotes}
                onChange={(e) => setFinNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinId(null)} className="backdrop-blur-md">Cancelar</Button>
            <Button onClick={handleFinalize} className="shadow-lg">Confirmar y Archivar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent className="backdrop-blur-[20px] bg-card/20 border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar asistencia del prospecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Marcarás esta cita como confirmada para el día de hoy. Esto ayuda a llevar un mejor control de tu agenda diaria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="backdrop-blur-md">Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              Sí, confirmar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
