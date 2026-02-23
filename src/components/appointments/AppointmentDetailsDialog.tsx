"use client"

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Appointment, AppointmentStatus, AppointmentType, AppointmentProduct } from '@/services/appointment-service';
import { User, Phone, Calendar, Clock, Edit2, Save, MessageCircle, Info, ClipboardList, CheckCircle2, Box, CalendarRange } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { parseISO, format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string, data: Partial<Appointment>) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
}

export default function AppointmentDetailsDialog({ 
  appointment, 
  open, 
  onOpenChange, 
  onEdit,
  formatFriendlyDate,
  format12hTime
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);
  const [editData, setEditData] = useState<Partial<Appointment>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (appointment) {
      setEditData(appointment);
    }
  }, [appointment]);

  const forceDOMCleanup = () => {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
    }, 150);
  };

  if (!appointment) return null;

  const handleSave = () => {
    onEdit(appointment.id, editData);
    setIsEditing(false);
    toast({ title: "Guardado", description: "La información ha sido actualizada." });
  };

  const handleRescheduleToToday = () => {
    const todayISO = new Date().toISOString();
    onEdit(appointment.id, { date: todayISO });
    setShowRescheduleConfirm(false);
    onOpenChange(false);
    toast({ 
      title: "Cita re-agendada", 
      description: `${appointment.name} movido para el día de hoy.` 
    });
  };

  const copyPhoneOnly = () => {
    if (!appointment.phone) return;
    navigator.clipboard.writeText(appointment.phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${appointment.phone} listo para usar.`,
      });
    });
  };

  const copyToWhatsAppFormat = () => {
    const dateObj = parseISO(appointment.date);
    const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
    const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    const timeFormatted = format12hTime(appointment.time);

    const motivoLine = appointment.type === '1ra consulta' ? '' : `Motivo: ${appointment.type}\n`;

    const text = `Cita: ${capitalizedDate}
Nombre: ${appointment.name}
${motivoLine}Producto: ${appointment.product || 'N/A'}
Hora: ${timeFormatted}
Número: ${appointment.phone}`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copiado", description: "Datos listos para WhatsApp." });
    });
  };

  const isScheduledForToday = isToday(parseISO(appointment.date));

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { 
        if(!o) {
          setIsEditing(false);
          forceDOMCleanup();
        } 
        onOpenChange(o); 
      }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border p-0 shadow-2xl backdrop-blur-[20px]">
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-headline font-bold text-foreground">
                Detalles
              </DialogTitle>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="p-1 rounded-full hover:bg-muted text-muted-foreground cursor-help">
                      <Info className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-[10px] font-mono uppercase tracking-widest">ID: {appointment.id}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button 
                  onClick={copyToWhatsAppFormat}
                  variant="outline" 
                  size="sm"
                  className="h-8 px-3 text-[10px] border-green-500 text-green-500 hover:bg-green-500/5 font-bold uppercase backdrop-blur-md"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Copiar
                </Button>
              )}
              <DialogClose className="h-8 w-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive transition-colors group backdrop-blur-md border border-destructive/20">
                <span className="text-xs font-bold group-hover:text-white">✕</span>
              </DialogClose>
            </div>
            <DialogDescription className="sr-only">Gestión de prospecto</DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="bg-muted/30" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Motivo</Label>
                    <Select 
                      value={editData.type} 
                      onValueChange={(v) => setEditData({...editData, type: v as AppointmentType})}
                    >
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue placeholder="Motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ra consulta">1ra consulta</SelectItem>
                        <SelectItem value="2da consulta">2da consulta</SelectItem>
                        <SelectItem value="cierre">Cierre</SelectItem>
                        <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Producto</Label>
                    <Select 
                      value={editData.product || 'Casa'} 
                      onValueChange={(v) => setEditData({...editData, product: v as AppointmentProduct})}
                    >
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue placeholder="Producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Departamento">Departamento</SelectItem>
                        <SelectItem value="Terreno">Terreno</SelectItem>
                        <SelectItem value="Transporte">Transporte</SelectItem>
                        <SelectItem value="Préstamo">Préstamo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resultado</Label>
                    <Select 
                      value={editData.status || 'Asistencia'} 
                      onValueChange={(v) => setEditData({...editData, status: v as AppointmentStatus})}
                    >
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
                    <Label>Fecha</Label>
                    <Input 
                      type="date" 
                      value={editData.date ? parseISO(editData.date).toISOString().split('T')[0] : ''} 
                      onChange={e => setEditData({...editData, date: new Date(e.target.value + 'T12:00:00Z').toISOString()})} 
                      className="bg-muted/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input type="time" value={editData.time || ''} onChange={e => setEditData({...editData, time: e.target.value})} className="bg-muted/30" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-muted/20 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Cliente</p>
                    <p className="text-sm font-semibold">{appointment.name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={copyPhoneOnly}
                    className="flex items-center gap-3 cursor-pointer group/phone"
                  >
                    <Phone className="w-4 h-4 text-primary group-hover/phone:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Teléfono</p>
                      <p className="text-sm group-hover/phone:text-primary transition-colors">{appointment.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Motivo</p>
                      <p className="text-sm">{appointment.type}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Box className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Producto</p>
                      <p className="text-sm font-medium">{appointment.product || 'Casa'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Hora</p>
                      <p className="text-xs font-medium">{format12hTime(appointment.time)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div className="flex flex-col">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight">Fecha</p>
                    <p className="text-xs font-medium">{formatFriendlyDate(appointment.date)}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter">
                      {format(parseISO(appointment.date), 'yyyy-MM-dd')}
                    </p>
                  </div>
                </div>

                {appointment.status && (
                  <div className="flex items-center gap-3 border-t border-border/20 pt-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Resultado</p>
                      <p className={cn(
                        "text-sm font-bold",
                        appointment.status === 'Apartado' ? "text-green-100/90" : "text-green-400"
                      )}>
                        {appointment.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase">📝 Notas</Label>
              <Textarea 
                placeholder="Detalles del prospecto..."
                className="min-h-[120px] bg-muted/30 border-border/50 focus-visible:ring-primary resize-none text-sm backdrop-blur-sm"
                value={isEditing ? editData.notes : appointment.notes}
                onChange={e => setEditData({...editData, notes: e.target.value})}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end items-center gap-2 border-t border-border/50 px-6 py-4 bg-card/30 backdrop-blur-md">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="backdrop-blur-md">Cancelar</Button>
                  <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground font-bold shadow-lg">
                    <Save className="w-3.5 h-3.5 mr-2" /> Guardar
                  </Button>
                </>
              ) : (
                <>
                  {!isScheduledForToday && (
                    <Button 
                      onClick={() => setShowRescheduleConfirm(true)} 
                      size="sm" 
                      variant="outline" 
                      className="font-bold border-primary text-primary hover:bg-primary/10 backdrop-blur-md"
                    >
                      <CalendarRange className="w-3.5 h-3.5 mr-2" /> Hoy
                    </Button>
                  )}
                  <Button onClick={() => setIsEditing(true)} size="sm" variant="secondary" className="font-bold backdrop-blur-md border border-border/50">
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRescheduleConfirm} onOpenChange={setShowRescheduleConfirm}>
        <AlertDialogContent className="bg-card border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Re-agendar para hoy?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción moverá la cita de <strong>{appointment.name}</strong> al día de hoy. Podrás verla en tu lista de prioridad inmediata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRescheduleToToday}
              className="bg-primary text-primary-foreground font-bold"
            >
              Sí, mover a hoy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
