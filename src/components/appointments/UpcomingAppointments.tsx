"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus, getCommissionPaymentDate } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, Calendar, CheckCircle2, AlertCircle, 
  CheckCircle, Trophy, PartyPopper, Sparkles, Copy, 
  ClipboardCheck, Phone, Box, ChevronRight, ShieldAlert, UserCog, Trash2
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
  archiveAppointment: (id: string) => void;
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
  archiveAppointment,
  activeId,
  expanded = false,
  theme = 'corporativo'
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  const isActuallyToday = (dateStr: string) => isToday(parseISO(dateStr));

  const handleArchive = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    archiveAppointment(app.id);
    toast({
      title: "Cita archivada",
      description: `${app.name} se ha movido a la papelera.`,
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

  const copyAllToday = () => {
    const todayApps = appointments.filter(app => isActuallyToday(app.date));
    if (todayApps.length === 0) return;

    const reportText = todayApps.map(app => {
      const timeFormatted = format12hTime(app.time);
      const confirmedText = app.isConfirmed ? ' * (Confirmado)*' : '';
      const motivoLine = app.type === '1ra consulta' ? '' : `\nMotivo: *${app.type}*`;
      return `📌 *${app.name}*\nHora: *${timeFormatted}*${confirmedText}${motivoLine}\nProducto: *${app.product || 'N/A'}*\nNúmero: *${app.phone}*`;
    }).join('\n\n---\n\n');

    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Citas de hoy copiadas",
        description: `${todayApps.length} citas listas para WhatsApp.`,
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
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">Sin citas programadas</p>
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
                  <TableHead className="bg-card w-12 text-center">Acción</TableHead>
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
                          {appToday && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0 shadow-[0_0_8px_hsl(var(--primary))]" title="Cita para hoy" />}
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
                        <div className="flex flex-col justify-center">
                          <span className={cn("text-[10px] font-bold uppercase mb-1.5", appToday ? "text-primary" : "text-muted-foreground")}>{formatDate(app.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] bg-accent/5 w-fit px-2 py-1 rounded-md border border-accent/20">
                          <Clock className="w-3 h-3" /> {format12hTime(app.time)}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleArchive(e, app)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {expanded && (
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onSelect(app)} type="button">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
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
        <Button variant="outline" size="sm" onClick={copyDailyReport} className="text-[10px] font-bold uppercase border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 h-9 gap-2 px-4" type="button">
          <ClipboardCheck className="w-4 h-4" /> Reporte Diario
        </Button>
        <Button variant="outline" size="sm" onClick={copyAllToday} className="text-[10px] font-bold uppercase border-green-500/40 text-green-500 hover:bg-green-500/10 h-9 gap-2 px-4" type="button">
          <Copy className="w-4 h-4" /> Citas Hoy
        </Button>
      </div>
    </div>
  );
}
