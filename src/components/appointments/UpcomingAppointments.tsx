"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Calendar, Info, CheckCircle2, AlertCircle, CheckCircle, Trophy, PartyPopper, Sparkles, Copy, ClipboardCheck } from "lucide-react";
import { parseISO, format, addDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
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
  DialogDescription,
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
  allAppointments: Appointment[];
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  onSelect: (app: Appointment) => void;
  updateStatus: (id: string, status: AppointmentStatus, notes?: string) => void;
  toggleConfirmation: (id: string) => void;
  highlightedId?: string | null;
}

export default function UpcomingAppointments({ 
  appointments, 
  allAppointments,
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

      if (currentStatus === 'Cierre') {
        setLastClosedApp(app);
      }

      updateStatus(finId, currentStatus, currentNotes);
      setFinId(null);
      setFinNotes('');

      if (currentStatus === 'Cierre') {
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

  const copyAllToday = () => {
    const todayApps = appointments.filter(app => isActuallyToday(app.date));
    if (todayApps.length === 0) {
      toast({
        title: "Sin citas para hoy",
        description: "No hay citas programadas para el día de hoy que copiar.",
      });
      return;
    }

    const formattedApps = todayApps.map(app => {
      const dateObj = parseISO(app.date);
      const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
      const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
      const timeFormatted = format12hTime(app.time);
      
      const motivoLine = app.type === '1ra consulta' ? '' : `Motivo: ${app.type}\n`;

      return `Cita: ${capitalizedDate}
Nombre: ${app.name}
${motivoLine}Producto: ${app.product || 'N/A'}
Hora: ${timeFormatted}
Número: ${app.phone}`;
    }).join('\n\n');

    navigator.clipboard.writeText(formattedApps).then(() => {
      toast({
        title: "Citas de hoy copiadas",
        description: `Se han copiado ${todayApps.length} citas al portapapeles.`,
      });
    });
  };

  const copyDailyReport = () => {
    const todaySales = allAppointments.filter(a => isActuallyToday(a.date) && a.status === 'Cierre').length;
    const todayTotal = allAppointments.filter(a => isActuallyToday(a.date)).length;
    const todayConfirmed = allAppointments.filter(a => isActuallyToday(a.date) && a.isConfirmed).length;
    const tomorrowTotal = allAppointments.filter(a => isActuallyTomorrow(a.date)).length;

    const reportText = `✅Ventas: ${todaySales}
✅Citas para hoy: ${todayTotal}
✅Citas confirmadas: ${todayConfirmed}
✅Citas para el día siguiente: ${tomorrowTotal}`;

    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Reporte diario copiado",
        description: "Las estadísticas del día han sido copiadas al portapapeles.",
      });
    });
  };

  const hasTodayApps = appointments.some(app => isActuallyToday(app.date));

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden relative backdrop-blur-sm">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20">
            <Calendar className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm font-medium">No hay citas programadas.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nombre / Teléfono</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha / Estado</TableHead>
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
                      "hover:bg-primary/10 transition-colors cursor-pointer group relative h-16",
                      appToday && "bg-primary/5 border-l-4 border-l-primary",
                      isHighlighted && "bg-accent/20 animate-pulse border-2 border-accent/40"
                    )}
                  >
                    <TableCell className="align-middle">
                      <div className="font-medium text-sm leading-tight">
                        {app.name}
                      </div>
                      <div 
                        onClick={(e) => copyPhone(e, app.phone)}
                        className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 group/phone"
                      >
                        {app.phone}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">
                        <Info className="w-3 h-3" /> {app.type}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex flex-col justify-center min-h-[2.5rem]">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider leading-none mb-1",
                          appToday ? "text-primary" : "text-muted-foreground"
                        )}>
                          {formatDate(app.date)}
                        </span>
                        {appToday && (
                          <div onClick={(e) => e.stopPropagation()} className="h-5 flex items-center">
                            {app.isConfirmed ? (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-green-400 uppercase tracking-tighter">
                                <CheckCircle className="w-2.5 h-2.5" /> Confirmada
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-5 px-1.5 py-0 text-[8px] font-bold uppercase border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 backdrop-blur-md"
                                onClick={() => setConfirmId(app.id)}
                              >
                                <AlertCircle className="w-2 h-2 mr-1" /> Confirmar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1 text-accent font-bold text-[10px]">
                        <Clock className="w-3 h-3" /> {format12hTime(app.time)}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle" onClick={(e) => e.stopPropagation()}>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copyDailyReport}
          className="text-[10px] font-bold uppercase tracking-widest border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 h-8 gap-2"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Copiar Reporte Diario
        </Button>
        {hasTodayApps && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyAllToday}
            className="text-[10px] font-bold uppercase tracking-widest border-green-500/40 text-green-500 hover:bg-green-500/10 h-8 gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar citas de hoy
          </Button>
        )}
      </div>

      <Dialog open={!!finId} onOpenChange={() => setFinId(null)}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar cita de hoy</DialogTitle>
            <DialogDescription>Indica el resultado de la reunión y registra acuerdos importantes.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Resultado final</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                <SelectTrigger className={cn("bg-muted/30", status === 'Cierre' && "border-green-500 text-green-500 bg-green-500/5")}>
                  <SelectValue placeholder="Selecciona resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asistencia">Asistencia</SelectItem>
                  <SelectItem value="No asistencia">No asistencia</SelectItem>
                  <SelectItem value="Continuación en otra cita">Continuación en otra cita</SelectItem>
                  <SelectItem value="Reagendó">Reagendó</SelectItem>
                  <SelectItem value="Reembolso">Reembolso</SelectItem>
                  <SelectItem value="Cierre">✨ Cierre ✨</SelectItem>
                  <SelectItem value="Apartado">Apartado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Notas de la cita</Label>
              <Textarea 
                placeholder="Escribe acuerdos, montos o próximos pasos aquí..." 
                className="bg-muted/30 min-h-[150px] resize-none"
                value={finNotes}
                onChange={(e) => setFinNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinId(null)}>Cancelar</Button>
            <Button onClick={handleFinalize} className={cn("shadow-lg", status === 'Cierre' && "bg-green-600 hover:bg-green-700")}>
              {status === 'Cierre' ? '¡Confirmar cierre!' : 'Confirmar y archivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[550px] bg-green-950/90 border-green-500/50 text-white backdrop-blur-xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse"></div>
              <div className="bg-green-500/20 p-4 rounded-full border border-green-400/30">
                <Trophy className="w-16 h-16 text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-3xl font-headline font-bold text-white flex items-center gap-3">
              <PartyPopper className="text-yellow-400" /> ¡FELICIDADES POR EL CIERRE! <PartyPopper className="text-yellow-400" />
            </DialogTitle>
            <DialogDescription className="text-green-100 text-lg text-center mx-auto">
              Has concretado el crédito de <strong>{lastClosedApp?.name}</strong> con éxito.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Checklist de cierre
              </h4>
              <p className="text-sm text-green-50/80 leading-relaxed">
                Asegúrate de registrar en las notas los siguientes datos para el expediente actualizado:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium text-white">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Monto del Crédito Final</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Comisiones</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Fecha de firma</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Anota cada detalle útil</li>
              </ul>
            </div>
            
            <p className="text-center text-[10px] text-green-200/60 uppercase font-bold">
              Este cierre se ha registrado en tus estadísticas mensuales
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={handleSuccessClose}
              className="bg-white text-green-900 hover:bg-green-50 font-bold px-10 h-12 rounded-xl text-lg transition-all transform hover:scale-105"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent className="bg-card border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar asistencia del prospecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Marcarás esta cita como confirmada para el día de hoy. Esto ayuda a llevar un mejor control de tu agenda diaria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
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
