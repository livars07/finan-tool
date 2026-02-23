"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Calendar, Info, CheckCircle2, AlertCircle, CheckCircle, Trophy, PartyPopper, Sparkles } from "lucide-react";
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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastClosedApp, setLastClosedApp] = useState<Appointment | null>(null);
  
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
      setFinId(null);
      setFinNotes('');

      if (currentStatus === 'Cierre') {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
        
        setLastClosedApp(app);
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

      <Dialog open={!!finId} onOpenChange={() => setFinId(null)}>
        <DialogContent className="sm:max-w-[500px] backdrop-blur-[20px] bg-card/10">
          <DialogHeader>
            <DialogTitle>Finalizar cita de hoy</DialogTitle>
            <DialogDescription>Indica el resultado de la reunión y registra acuerdos importantes.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Resultado final</Label>
              <span className="sr-only">Selección de estatus de cita</span>
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
            <Button variant="outline" onClick={() => setFinId(null)} className="backdrop-blur-md">Cancelar</Button>
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
            <DialogDescription className="text-green-100 text-lg">
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
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Y cualquier detalle importante del cliente</li>
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
