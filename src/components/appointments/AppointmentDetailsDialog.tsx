
"use client"

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogClose, DialogDescription
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
import { User, Phone, Clock, Edit2, Save, Copy, Info, ClipboardList, CheckCircle2, Box, CalendarPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string, data: Partial<Appointment>) => void;
  onAdd: (app: Omit<Appointment, 'id'>) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
}

export default function AppointmentDetailsDialog({ 
  appointment, 
  open, 
  onOpenChange, 
  onEdit,
  onAdd,
  format12hTime
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [editData, setEditData] = useState<Partial<Appointment>>({});
  
  // State for new 2nd appointment
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newProduct, setNewProduct] = useState<AppointmentProduct>('Casa');

  const { toast } = useToast();

  useEffect(() => {
    if (appointment) {
      setEditData(appointment);
    }
  }, [appointment]);

  useEffect(() => {
    if (isRescheduling && appointment) {
      setNewName(appointment.name);
      setNewProduct(appointment.product || 'Casa');
      setNewNotes(appointment.notes || '');
      setNewPhone('');
      setNewDate('');
      setNewTime('');
    }
  }, [isRescheduling, appointment]);

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

  const handleConfirmSecond = () => {
    if (!newDate || !newTime) {
      toast({ title: "Error", description: "Fecha y hora son obligatorias.", variant: "destructive" });
      return;
    }

    const isoDate = new Date(newDate + 'T12:00:00Z').toISOString();
    onAdd({
      name: newName,
      phone: newPhone,
      date: isoDate,
      time: newTime,
      type: '2da consulta',
      product: newProduct,
      notes: newNotes,
    });

    setIsRescheduling(false);
    toast({ title: "2da Consulta Agendada", description: `Nueva cita registrada para ${newName}.` });
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
    
    const dateBold = `*${capitalizedDate}*`;
    const timeBold = `*${timeFormatted}*`;
    const confirmedBold = appointment.isConfirmed ? ' * (Confirmado)*' : '';

    const motivoLine = appointment.type === '1ra consulta' ? '' : `Motivo: *${appointment.type}*\n`;

    const text = `Cita: ${dateBold}
Nombre: *${appointment.name}*
${motivoLine}Producto: *${appointment.product || 'N/A'}*
Hora: ${timeBold}${confirmedBold}
Número: *${appointment.phone}*`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copiado", description: "Datos listos para WhatsApp." });
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { 
        if(!o) {
          setIsEditing(false);
          forceDOMCleanup();
        } 
        onOpenChange(o); 
      }}>
        <DialogContent className="sm:max-w-[550px] bg-card border-border p-0 shadow-xl backdrop-blur-md z-[70] overflow-hidden flex flex-col max-h-[95vh]">
          <DialogHeader className="px-6 py-3 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-headline font-bold text-foreground">
                {isEditing ? 'Editar Registro' : 'Detalles'}
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
                  className="h-7 px-2 text-[9px] border-primary/40 text-primary hover:bg-primary/5 font-bold uppercase backdrop-blur-md"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar datos
                </Button>
              )}
              <DialogClose className="h-7 w-7 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive transition-colors group backdrop-blur-md border border-destructive/20">
                <span className="text-[10px] font-bold group-hover:text-white">✕</span>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre</Label>
                    <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="h-8 bg-muted/20 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Teléfono</Label>
                    <Input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="h-8 bg-muted/20 text-sm" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Motivo</Label>
                    <Select value={editData.type} onValueChange={(v) => setEditData({...editData, type: v as AppointmentType})}>
                      <SelectTrigger className="h-8 bg-muted/20 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ra consulta">1ra consulta</SelectItem>
                        <SelectItem value="2da consulta">2da consulta</SelectItem>
                        <SelectItem value="cierre">Cierre</SelectItem>
                        <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Producto</Label>
                    <Select value={editData.product || 'Casa'} onValueChange={(v) => setEditData({...editData, product: v as AppointmentProduct})}>
                      <SelectTrigger className="h-8 bg-muted/20 text-sm">
                        <SelectValue />
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Estatus</Label>
                    <Select value={editData.status || 'Asistencia'} onValueChange={(v) => setEditData({...editData, status: v as AppointmentStatus})}>
                      <SelectTrigger className="h-8 bg-muted/20 text-sm">
                        <SelectValue />
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
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Fecha</Label>
                    <Input 
                      type="date" 
                      value={editData.date ? parseISO(editData.date).toISOString().split('T')[0] : ''} 
                      onChange={e => setEditData({...editData, date: new Date(e.target.value + 'T12:00:00Z').toISOString()})} 
                      className="h-8 bg-muted/20 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Hora</Label>
                    <Input type="time" value={editData.time || ''} onChange={e => setEditData({...editData, time: e.target.value})} className="h-8 bg-muted/20 text-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 bg-muted/10 p-4 rounded-xl border border-border/30 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><User className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Cliente</p>
                    <p className="text-sm font-bold">{appointment.name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={copyPhoneOnly} className="flex items-center gap-3 cursor-pointer group/phone">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover/phone:bg-primary/20 transition-colors"><Phone className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Teléfono</p>
                      <p className="text-xs font-semibold group-hover/phone:text-primary transition-colors">{appointment.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg"><ClipboardList className="w-4 h-4 text-accent" /></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Motivo</p>
                      <p className="text-xs font-semibold">{appointment.type}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Box className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Producto</p>
                      <p className="text-xs font-semibold">{appointment.product || 'Casa'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Clock className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Hora</p>
                      <p className="text-xs font-semibold">{format12hTime(appointment.time)}</p>
                    </div>
                  </div>
                </div>

                {appointment.status && (
                  <div className="flex items-center gap-3 border-t border-border/20 pt-3">
                    <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-400" /></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Resultado</p>
                      <p className="text-xs font-bold text-green-500">{appointment.status}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 shrink-0 flex flex-col">
              <Label className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider shrink-0 mb-1">📝 Notas del cliente</Label>
              <Textarea 
                placeholder="Detalles importantes..."
                className={cn(
                  "bg-muted/10 border-border/30 focus-visible:ring-primary resize-none text-xs backdrop-blur-sm scrollbar-thin",
                  "h-[300px] min-h-[300px] overflow-y-auto"
                )}
                value={isEditing ? editData.notes : appointment.notes}
                onChange={e => setEditData({...editData, notes: e.target.value})}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between items-center gap-2 border-t border-border/30 px-6 py-3 bg-card/10 backdrop-blur-sm shrink-0">
            <div className="flex-1">
              {!isEditing && (
                <Button 
                  onClick={() => setIsRescheduling(true)}
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-bold uppercase text-primary hover:bg-primary/10"
                >
                  <CalendarPlus className="w-3.5 h-3.5 mr-2" />
                  Agendar 2da cita
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="h-8 text-xs">Cancelar</Button>
                  <Button size="sm" onClick={handleSave} className="h-8 text-xs bg-primary font-bold shadow-lg">
                    <Save className="w-3.5 h-3.5 mr-2" /> Guardar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm" variant="secondary" className="h-8 text-xs font-bold border border-border/50">
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border shadow-2xl backdrop-blur-md z-[80]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-primary" />
              Programar Seguimiento
            </DialogTitle>
            <DialogDescription className="text-xs">
              Agendando una segunda consulta para <strong>{newName}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nombre</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} className="h-9 bg-muted/20 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Teléfono</Label>
                <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Opcional" className="h-9 bg-muted/20 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Producto</Label>
                <Select value={newProduct} onValueChange={(v) => setNewProduct(v as AppointmentProduct)}>
                  <SelectTrigger className="h-9 bg-muted/20 text-sm">
                    <SelectValue />
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
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Motivo</Label>
                <div className="h-9 flex items-center px-3 bg-primary/10 border border-primary/20 rounded-md text-xs font-bold text-primary">
                  2da consulta
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nueva Fecha</Label>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="h-9 bg-muted/20 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nueva Hora</Label>
                <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="h-9 bg-muted/20 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Notas de Seguimiento</Label>
              <Textarea 
                value={newNotes} 
                onChange={e => setNewNotes(e.target.value)} 
                className="bg-muted/10 border-border/30 h-24 resize-none text-xs" 
                placeholder="Escribe acuerdos previos o temas a tratar..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRescheduling(false)} className="h-9 text-xs">Cancelar</Button>
            <Button onClick={handleConfirmSecond} className="h-9 text-xs bg-primary font-bold shadow-lg">
              Confirmar 2da consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
