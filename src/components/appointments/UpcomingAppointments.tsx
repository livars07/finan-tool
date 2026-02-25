"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, Calendar, Info, CheckCircle2, AlertCircle, 
  CheckCircle, Trophy, PartyPopper, Sparkles, Copy, 
  ClipboardCheck, Phone, Box, ChevronRight, ShieldAlert, UserCog
} from "lucide-react";
import { parseISO, isToday, addDays } from 'date-fns';
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
  updateStatus: (id: string, status: AppointmentStatus, notes?: string) => void;
  toggleConfirmation: (id: string) => void;
  activeId?: string | null;
  expanded?: boolean;
}

export default function UpcomingAppointments({ 
  appointments, 
  allAppointments,
  formatDate, 
  format12hTime, 
  onSelect, 
  onHighlight,
  updateStatus, 
  toggleConfirmation, 
  activeId,
  expanded = false
}: Props) {
  const [finId, setFinId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [status, setStatus] = useState<AppointmentStatus>('Asistencia');
  const [finNotes, setFinNotes] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastFinishedApp, setLastFinishedApp] = useState<Appointment | null>(null);
  
  const { toast } = useToast();

  const isActuallyToday = (dateStr: string) => isToday(parseISO(dateStr));

  const handleConfirmAction = () => {
    if (confirmId) {
      const app = appointments.find(a => a.id === confirmId);
      toggleConfirmation(confirmId);
      setConfirmId(null);
      toast({
        title: "Asistencia confirmada",
        description: `Se ha confirmado la asistencia de ${app?.name}.`,
      });
    }
  };

  const handleFinalize = () => {
    if (!finId) return;
    
    const app = appointments.find(a => a.id === finId);
    if (!app) return;

    updateStatus(finId, status, finNotes);
    
    const updatedApp = { ...app, status, notes: finNotes };
    setLastFinishedApp(updatedApp);
    const isCierre = status === 'Cierre';
    
    setFinId(null);
    setFinNotes('');

    if (isCierre) {
      setTimeout(() => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
        audio.volume = 0.4;
        audio.play().catch(() => {});
        setShowSuccessDialog(true);
      }, 300);
    } else {
      setTimeout(() => {
        onSelect(updatedApp);
        toast({
          title: "Consulta finalizada",
          description: `${app.name} ha sido movido al historial con estatus: ${status}.`,
        });
      }, 300);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    if (lastFinishedApp) {
      setTimeout(() => onSelect(lastFinishedApp), 300);
    }
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

  const copyProspectorPhone = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    if (!app.prospectorPhone) return;
    onHighlight(app);
    navigator.clipboard.writeText(app.prospectorPhone).then(() => {
      toast({
        title: "Prospectador copiado",
        description: `${app.prospectorName}: ${app.prospectorPhone} listo.`,
      });
    });
  };

  const copyDailyReport = () => {
    const todaySales = allAppointments.filter(a => isActuallyToday(a.date) && a.status === 'Cierre').length;
    const todayTotal = allAppointments.filter(a => isActuallyToday(a.date)).length;
    const todayConfirmed = allAppointments.filter(a => isActuallyToday(a.date) && a.isConfirmed).length;
    const tomorrowTotal = allAppointments.filter(a => {
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

  const hasTodayApps = appointments.some(app => isActuallyToday(app.date));

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
                  <TableHead className={cn("bg-card", expanded ? "w-[180px]" : "")}>Nombre / Teléfono</TableHead>
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
                  const isCierre = app.status === 'Cierre';
                  const isCommissionPending = isCierre && app.commissionStatus !== 'Pagada';
                  
                  return (
                    <TableRow 
                      key={app.id} 
                      onClick={() => onSelect(app)}
                      className={cn(
                        "hover:bg-primary/10 transition-colors cursor-pointer group relative h-16",
                        appToday && "bg-primary/5 border-l-4 border-l-primary",
                        isSelected && "bg-primary/20 border-l-4 border-l-primary z-10"
                      )}
                    >
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-sm leading-tight text-foreground">{app.name}</div>
                          {app.prospectorName && (
                            <TooltipProvider>
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="p-1 rounded-full bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                                    onClick={(e) => copyProspectorPhone(e, app)}
                                  >
                                    <UserCog className="h-3 w-3" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-[10px] font-bold uppercase">Agendado por: {app.prospectorName}</p>
                                  {app.prospectorPhone && <p className="text-[9px] text-muted-foreground">Click para copiar: {app.prospectorPhone}</p>}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        {!expanded && (
                          <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" /> 
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
                          {appToday && (
                            <div onClick={(e) => e.stopPropagation()} className="h-5 flex items-center">
                              {app.isConfirmed ? (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-green-400 uppercase bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                  <CheckCircle className="w-2.5 h-2.5" /> Confirmada
                                </div>
                              ) : (
                                <Button variant="outline" size="sm" className="h-5 px-2 text-[8px] font-bold border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" onClick={() => setConfirmId(app.id)} type="button">
                                  <AlertCircle className="w-2.5 h-2.5 mr-1" /> Confirmar
                                </Button>
                              )}
                            </div>
                          )}
                          {isCommissionPending && (
                            <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-orange-500 animate-pulse">
                              <ShieldAlert className="w-2.5 h-2.5" /> PAGO PENDIENTE
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] bg-accent/5 w-fit px-2 py-1 rounded-md border border-accent/20">
                          <Clock className="w-3 h-3" /> {format12hTime(app.time)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {appToday && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/20"
                              onClick={() => { setFinId(app.id); setFinNotes(app.notes || ''); setStatus('Asistencia'); }}
                              type="button"
                            >
                              <CheckCircle2 className="h-5 h-5" />
                            </Button>
                          )}
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
        {hasTodayApps && (
          <Button variant="outline" size="sm" onClick={copyAllToday} className="text-[10px] font-bold uppercase border-green-500/40 text-green-500 hover:bg-green-500/10 h-9 gap-2 px-4" type="button">
            <Copy className="w-4 h-4" /> Citas Hoy
          </Button>
        )}
      </div>

      <Dialog open={!!finId} onOpenChange={(open) => !open && setFinId(null)}>
        <DialogContent 
          className="sm:max-w-[450px] bg-card border-border shadow-2xl backdrop-blur-[12px] z-[80]"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Finalizar Consulta</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Registra el resultado de la reunión con el prospecto.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Estatus Final</Label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-ring",
                  status === 'Cierre' && "border-green-500 text-green-600 bg-green-500/5 font-bold"
                )}
              >
                <option value="Asistencia">Asistencia</option>
                <option value="No asistencia">No asistencia</option>
                <option value="Continuación en otra cita">Continuación en otra cita</option>
                <option value="Reagendó">Reagendó</option>
                <option value="Reembolso">Reembolso</option>
                <option value="Cierre">✨ Cierre ✨</option>
                <option value="Apartado">Apartado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Acuerdos y Notas</Label>
              <Textarea 
                placeholder="Escribe montos, fechas o acuerdos aquí..." 
                className="bg-muted/10 border-border/30 min-h-[120px] resize-none text-xs"
                value={finNotes}
                onChange={(e) => setFinNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFinId(null)} className="h-9 text-xs" type="button">Volver</Button>
            <Button onClick={handleFinalize} className={cn("h-9 text-xs font-bold shadow-lg", status === 'Cierre' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary text-primary-foreground")} type="button">
              {status === 'Cierre' ? 'Confirmar Venta' : 'Cerrar Consulta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent 
          className="sm:max-w-[550px] border shadow-2xl backdrop-blur-md overflow-hidden p-0 bg-green-950 border-green-500/50 text-white z-[90]"
        >
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-500/20 p-5 rounded-full border border-green-400/30 relative z-10">
                <Trophy className="w-16 h-16 text-green-400" />
              </div>
              <DialogTitle className="text-3xl font-headline font-bold flex items-center gap-3 text-white">
                <PartyPopper className="text-yellow-500" /> ¡FELICIDADES! <PartyPopper className="text-yellow-500" />
              </DialogTitle>
              <DialogDescription className="text-lg text-center mx-auto text-green-100">
                Has concretado el crédito de <strong className="text-white">{lastFinishedApp?.name}</strong> con éxito.
              </DialogDescription>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Recomendaciones de cierre</h4>
              <p className="text-sm text-green-50/80 leading-relaxed">Para garantizar la integridad administrativa del expediente, asegúrate de haber registrado:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-white">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Monto del Crédito Final</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Cálculo de Comisiones</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Fecha estimada de Firma</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Notas de acuerdos verbales</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="p-6 bg-green-900/50 border-t border-green-800/50 sm:justify-center">
            <Button onClick={handleSuccessClose} className="bg-green-600 hover:bg-green-700 text-white font-bold px-12 h-14 rounded-2xl text-xl shadow-xl transition-all transform hover:scale-105" type="button">Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent 
          className="bg-card border-border shadow-2xl backdrop-blur-md z-[85]"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Confirmar asistencia?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Marcarás esta cita como confirmada para el día de hoy.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} className="bg-green-600 hover:bg-green-700 text-white font-bold" type="button">Sí, confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
