
"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus, getCommissionPaymentDate } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, Calendar, CheckCircle2, AlertCircle, 
  CheckCircle, Trophy, PartyPopper, Sparkles, Copy, 
  ClipboardCheck, Phone, Box, ChevronRight, ShieldAlert, UserCog, Trash2, RotateCcw, Archive
} from "lucide-react";
import { parseISO, isToday, addDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointments: Appointment[];
  allAppointments: Appointment[];
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  onSelect: (app: Appointment) => void;
  onHighlight: (app: Appointment) => void;
  editAppointment: (id: string, data: Partial<Appointment>) => void;
  archiveAppointment: (id: string) => void;
  unarchiveAppointment: (id: string) => void;
  activeId?: string | null;
  expanded?: boolean;
  theme?: string;
}

export default function UpcomingAppointments({ 
  appointments, 
  allAppointments,
  formatDate, 
  format12hTime, 
  onSelect, 
  onHighlight,
  editAppointment,
  archiveAppointment,
  unarchiveAppointment,
  activeId,
  expanded = false,
  theme = 'corporativo'
}: Props) {
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  const isActuallyToday = (dateStr: string) => isToday(parseISO(dateStr));

  const handleConfirmArchive = () => {
    if (archiveConfirmId) {
      const app = appointments.find(a => a.id === archiveConfirmId);
      archiveAppointment(archiveConfirmId);
      toast({
        title: "Cita archivada",
        description: `${app?.name} se ha movido a archivadas.`,
      });
      setArchiveConfirmId(null);
    }
  };

  const handleRestoreAction = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    unarchiveAppointment(app.id);
    toast({
      title: "Cita restaurada",
      description: `${app.name} ha vuelto a activas.`,
    });
  };

  const handleToggleConfirmation = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    const newStatus = !app.isConfirmed;
    editAppointment(app.id, { isConfirmed: newStatus });
    toast({
      title: newStatus ? "Cita Confirmada" : "Confirmación Removida",
      description: newStatus 
        ? `${app.name} ha confirmado su asistencia para hoy.` 
        : `Se ha quitado la marca de confirmación para ${app.name}.`,
    });
  };

  const copyPhone = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    onHighlight(app);
    navigator.clipboard.writeText(app.phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${app.name}: ${app.phone} listo para usar.`,
      });
    });
  };

  const copyDailyReport = () => {
    const todaySales = allAppointments.filter(a => isActuallyToday(a.date) && a.status === 'Cierre' && !a.isArchived).length;
    const todayTotal = allAppointments.filter(a => isActuallyToday(a.date) && !a.isArchived).length;
    const todayConfirmed = allAppointments.filter(a => isActuallyToday(a.date) && a.isConfirmed && !a.isArchived).length;
    const tomorrowTotal = allAppointments.filter(a => {
      if (a.isArchived) return false;
      const d = parseISO(a.date);
      const tomorrow = addDays(new Date(), 1);
      return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
    }).length;

    const reportText = `✅ Ventas: *${todaySales}*
✅ Citas para hoy: *${todayTotal}*
✅ Citas confirmadas: *${todayConfirmed}*
✅ Citas para el día siguiente: *${tomorrowTotal}*`;

    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Reporte diario copiado",
        description: "Estadísticas del día listas para enviar.",
      });
    });
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className={cn(
        "border rounded-xl overflow-hidden relative backdrop-blur-sm bg-card/20 flex flex-col",
        !expanded ? "h-[400px]" : "h-full flex-1"
      )}>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 h-full">
            <Calendar className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay citas en esta lista</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 scrollbar-thin">
            <Table className="border-collapse separate border-spacing-0">
              <TableHeader className="sticky top-0 z-30 bg-card shadow-sm border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className={cn("bg-card pl-4", expanded ? "w-[180px]" : "")}>Nombre / Teléfono</TableHead>
                  {expanded && <TableHead className="bg-card w-[140px]">Contacto</TableHead>}
                  <TableHead className="bg-card">Motivo</TableHead>
                  {expanded && <TableHead className="bg-card">Producto</TableHead>}
                  <TableHead className="bg-card">Fecha / Estado</TableHead>
                  <TableHead className="bg-card">Hora</TableHead>
                  <TableHead className="bg-card w-24 text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((app) => {
                  const appToday = isActuallyToday(app.date);
                  const isSelected = activeId === app.id;
                  
                  return (
                    <TableRow 
                      key={app.id} 
                      onClick={() => onSelect(app)}
                      className={cn(
                        "hover:bg-primary/10 transition-colors cursor-pointer group relative h-16",
                        appToday && "bg-primary/10",
                        isSelected && "bg-primary/20 z-10"
                      )}
                    >
                      <TableCell className="align-middle pl-4">
                        <div className="flex items-center gap-2">
                          {appToday && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "w-6 h-6 rounded-full shrink-0 transition-all",
                                app.isConfirmed ? "bg-green-500 text-white hover:bg-green-600" : "bg-primary/20 text-primary animate-pulse hover:bg-primary/30"
                              )}
                              onClick={(e) => handleToggleConfirmation(e, app)}
                              title={app.isConfirmed ? "Confirmado" : "Click para confirmar asistencia"}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <div className="font-bold text-sm leading-tight text-foreground">{app.name}</div>
                        </div>
                        {!expanded && (
                          <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 ml-4" /> 
                            <span 
                              onClick={(e) => copyPhone(e, app)} 
                              className="hover:text-primary transition-colors cursor-pointer font-medium"
                            >
                              {app.phone}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      {expanded && (
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Phone className="w-3.5 h-3.5" /></div>
                            <span 
                              onClick={(e) => copyPhone(e, app)} 
                              className="hover:text-primary transition-colors cursor-pointer font-bold"
                            >
                              {app.phone}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="align-middle text-[10px] font-bold text-muted-foreground uppercase">{app.type}</TableCell>
                      {expanded && (
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2 text-xs font-semibold"><Box className="w-3.5 h-3.5 text-accent" /> {app.product || 'N/A'}</div>
                        </TableCell>
                      )}
                      <TableCell className="align-middle">
                        <span className={cn("text-[10px] font-bold uppercase", appToday ? "text-primary" : "text-muted-foreground")}>{formatDate(app.date)}</span>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] bg-accent/5 w-fit px-2 py-1 rounded-md border border-accent/20">
                          <Clock className="w-3 h-3" /> {format12hTime(app.time)}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {app.isArchived ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                              onClick={(e) => handleRestoreAction(e, app)}
                              title="Restaurar"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setArchiveConfirmId(app.id); }}
                              title="Archivar"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-primary transition-colors" onClick={() => onSelect(app)}>
                            <ChevronRight className="h-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-3 pt-2 shrink-0">
        <Button variant="outline" size="sm" onClick={copyDailyReport} className="text-[10px] font-bold uppercase border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 h-9 gap-2 px-4">
          <ClipboardCheck className="w-4 h-4" /> Reporte Diario
        </Button>
      </div>

      <AlertDialog open={!!archiveConfirmId} onOpenChange={(o) => !o && setArchiveConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              La cita se moverá a la papelera. Podrás restaurarla en cualquier momento desde el selector de vista "Archivadas".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchive} className="bg-destructive hover:bg-destructive/90 text-white">
              Sí, archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
