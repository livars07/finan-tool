"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, Calendar, Info, CheckCircle2, AlertCircle, 
  CheckCircle, Trophy, PartyPopper, Sparkles, Copy, 
  ClipboardCheck, Phone, Box, ChevronRight 
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
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointments: Appointment[];
  allAppointments: Appointment[];
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  onSelect: (app: Appointment) => void;
  updateStatus: (id: string, status: AppointmentStatus, notes?: string) => void;
  toggleConfirmation: (id: string) => void;
  highlightedId?: string | null;
  expanded?: boolean;
}

export default function UpcomingAppointments({ 
  appointments, 
  allAppointments,
  formatDate, 
  format12hTime, 
  onSelect, 
  updateStatus, 
  toggleConfirmation, 
  highlightedId,
  expanded = false
}: Props) {
  const [finId, setFinId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [status, setStatus] = useState<AppointmentStatus>('Asistencia');
  const [finNotes, setFinNotes] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastClosedApp, setLastClosedApp] = useState<Appointment | null>(null);
  
  const { toast } = useToast();

  const isActuallyToday = (dateStr: string) => {
    return isToday(parseISO(dateStr));
  };

  const isActuallyTomorrow = (dateStr: string) => {
    const d = parseISO(dateStr);
    const tomorrow = addDays(new Date(), 1);
    return d.getDate() === tomorrow.getDate() && 
           d.getMonth() === tomorrow.getMonth() && 
           d.getFullYear() === tomorrow.getFullYear();
  };

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
    if (finId) {
      const app = appointments.find(a => a.id === finId);
      if (!app) return;
      
      const currentStatus = status;
      const currentNotes = finNotes;
      const clientName = app.name;

      updateStatus(finId, currentStatus, currentNotes);

      if (currentStatus === 'Cierre') {
        const updatedApp = { ...app, status: currentStatus, notes: currentNotes };
        setLastClosedApp(updatedApp);
        
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});

        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Cita finalizada",
          description: `${clientName} movido al historial con resultado: ${currentStatus}.`,
        });
      }

      setFinId(null);
      setFinNotes('');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    if (lastClosedApp) {
      onSelect(lastClosedApp);
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

  const copyDailyReport = () => {
    const todaySales = allAppointments.filter(a => isActuallyToday(a.date) && a.status === 'Cierre').length;
    const todayTotal = allAppointments.filter(a => isActuallyToday(a.date)).length;
    const todayConfirmed = allAppointments.filter(a => isActuallyToday(a.date) && a.isConfirmed).length;
    const tomorrowTotal = allAppointments.filter(a => isActuallyTomorrow(a.date)).length;

    const reportText = `✅ Ventas: *${todaySales}*
✅ Citas para hoy: *${todayTotal}*
✅ Citas confirmadas: *${todayConfirmed}*
✅ Citas para el día siguiente: *${tomorrowTotal}*`;

    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Reporte diario copiado",
        description: "Las estadísticas del día han sido copiadas al portapapeles.",
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
      
      return `📌 *${app.name}*
Hora: *${timeFormatted}*${confirmedText}${motivoLine}
Producto: *${app.product || 'N/A'}*
Número: *${app.phone}*`;
    }).join('\n\n---\n\n');

    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Citas de hoy copiadas",
        description: `${todayApps.length} citas listas para enviar.`,
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
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay citas programadas</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 scrollbar-thin">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className={expanded ? "w-[250px]" : ""}>Nombre / Teléfono</TableHead>
                  {expanded && <TableHead>Contacto</TableHead>}
                  <TableHead>Motivo</TableHead>
                  {expanded && <TableHead>Producto</TableHead>}
                  <TableHead>Fecha / Estado</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="w-12 text-center">Acciones</TableHead>
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
                        "hover:bg-primary/10 transition-colors cursor-pointer group relative h-16",
                        appToday && "bg-primary/5 border-l-4 border-l-primary",
                        isHighlighted && "bg-accent/20 animate-pulse border-2 border-accent/40"
                      )}
                    >
                      <TableCell className="align-middle">
                        <div className="font-bold text-sm leading-tight text-foreground">
                          {app.name}
                        </div>
                        {!expanded && (
                          <div 
                            onClick={(e) => copyPhone(e, app.phone)}
                            className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 group/phone mt-0.5"
                          >
                            <Phone className="w-2.5 h-2.5" /> {app.phone}
                          </div>
                        )}
                      </TableCell>
                      
                      {expanded && (
                        <TableCell className="align-middle">
                          <div 
                            onClick={(e) => copyPhone(e, app.phone)}
                            className="flex items-center gap-2 text-xs font-medium hover:text-primary transition-colors cursor-pointer"
                          >
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                              <Phone className="w-3.5 h-3.5" />
                            </div>
                            {app.phone}
                          </div>
                        </TableCell>
                      )}

                      <TableCell className="align-middle">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                          <Info className="w-3 h-3 text-primary/60" /> {app.type}
                        </div>
                      </TableCell>

                      {expanded && (
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <Box className="w-3.5 h-3.5 text-accent" /> {app.product || 'N/A'}
                          </div>
                        </TableCell>
                      )}

                      <TableCell className="align-middle">
                        <div className="flex flex-col justify-center">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider leading-none mb-1.5",
                            appToday ? "text-primary" : "text-muted-foreground"
                          )}>
                            {formatDate(app.date)}
                          </span>
                          {appToday && (
                            <div onClick={(e) => e.stopPropagation()} className="h-5 flex items-center">
                              {app.isConfirmed ? (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-green-400 uppercase tracking-tighter bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                  <CheckCircle className="w-2.5 h-2.5" /> Confirmada
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-5 px-2 py-0 text-[8px] font-bold uppercase border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 backdrop-blur-md"
                                  onClick={() => setConfirmId(app.id)}
                                >
                                  <AlertCircle className="w-2.5 h-2.5 mr-1" /> Confirmar
                                </Button>
                              )}
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
                              className="h-8 w-8 text-primary hover:bg-primary/20 backdrop-blur-md"
                              onClick={() => {
                                setFinId(app.id);
                                setFinNotes(app.notes || '');
                                setStatus('Asistencia');
                              }}
                              title="Finalizar cita"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          )}
                          {expanded && (
                             <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => onSelect(app)}
                            >
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copyDailyReport}
          className="text-[10px] font-bold uppercase tracking-widest border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 h-9 gap-2 px-4"
        >
          <ClipboardCheck className="w-4 h-4" />
          Copiar Reporte Diario
        </Button>
        {hasTodayApps && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyAllToday}
            className="text-[10px] font-bold uppercase tracking-widest border-green-500/40 text-green-500 hover:bg-green-500/10 h-9 gap-2 px-4"
          >
            <Copy className="w-4 h-4" />
            Copiar citas de hoy
          </Button>
        )}
      </div>

      <Dialog open={!!finId} onOpenChange={(open) => !open && setFinId(null)}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border shadow-2xl backdrop-blur-[12px] z-[80]">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Finalizar Consulta
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Registra el resultado de la reunión con el prospecto.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Estatus Final</Label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Acuerdos y Notas</Label>
              <Textarea 
                placeholder="Escribe montos, fechas o acuerdos aquí..." 
                className="bg-muted/10 border-border/30 min-h-[120px] resize-none text-xs scrollbar-thin"
                value={finNotes}
                onChange={(e) => setFinNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFinId(null)} className="h-9 text-xs">Volver</Button>
            <Button onClick={handleFinalize} className={cn("h-9 text-xs font-bold shadow-lg", status === 'Cierre' ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary text-primary-foreground")}>
              {status === 'Cierre' ? 'Confirmar Venta' : 'Cerrar Consulta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[550px] border shadow-2xl backdrop-blur-md overflow-hidden p-0 bg-green-950 border-green-500/50 text-white z-[90]">
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse"></div>
                <div className="bg-green-500/20 p-5 rounded-full border border-green-400/30 relative z-10">
                  <Trophy className="w-16 h-16 text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-3xl font-headline font-bold flex items-center gap-3 text-white">
                <PartyPopper className="text-yellow-500" /> ¡FELICIDADES! <PartyPopper className="text-yellow-500" />
              </DialogTitle>
              <DialogDescription className="text-lg text-center mx-auto text-green-100">
                Has concretado el crédito de <strong className="text-white">{lastClosedApp?.name}</strong> con éxito.
              </DialogDescription>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recomendaciones de cierre
              </h4>
              <p className="text-sm text-green-50/80 leading-relaxed">
                Para garantizar la integridad administrativa del expediente, asegúrate de haber registrado:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-white">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Monto del Crédito Final</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Cálculo de Comisiones</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Fecha estimada de Firma</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Notas de acuerdos verbales</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="p-6 bg-green-900/50 border-t border-green-800/50 sm:justify-center">
            <Button 
              onClick={handleSuccessClose}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-12 h-14 rounded-2xl text-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent className="bg-card border-border shadow-2xl backdrop-blur-md z-[85]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Confirmar asistencia del prospecto?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Marcarás esta cita como confirmada para el día de hoy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg font-bold"
            >
              Sí, confirmar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
