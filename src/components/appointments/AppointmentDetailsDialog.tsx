"use client"

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Appointment, AppointmentStatus, AppointmentType } from '@/hooks/use-appointments';
import { User, Phone, Calendar, Clock, BookOpen, Trash2, Edit2, Save, MessageCircle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Appointment>) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
}

export default function AppointmentDetailsDialog({ 
  appointment, 
  open, 
  onOpenChange, 
  onDelete, 
  onEdit,
  formatFriendlyDate,
  format12hTime
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState<Partial<Appointment>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (appointment) {
      setEditData(appointment);
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleSave = () => {
    onEdit(appointment.id, editData);
    setIsEditing(false);
    toast({ title: "Guardado", description: "La información del cliente ha sido actualizada." });
  };

  const handleDelete = () => {
    // Cerramos primero el AlertDialog para evitar conflictos de overlays bloqueados
    setShowDeleteConfirm(false);
    
    // Esperamos un instante mínimo para que la transición de salida inicie 
    // y no se quede el scroll lock o el pointer-events atrapado en el body
    setTimeout(() => {
      onDelete(appointment.id);
      onOpenChange(false);
      toast({ 
        title: "Registro eliminado", 
        description: `Se ha borrado el historial de ${appointment.name}.` 
      });
    }, 100);
  };

  const copyToWhatsAppFormat = () => {
    if (!appointment) return;
    
    const dateObj = parseISO(appointment.date);
    const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
    const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    const timeFormatted = format12hTime(appointment.time);

    const text = `Cita: ${capitalizedDate}
Nombre: ${appointment.name}
Producto: Casa
Hora: ${timeFormatted}
Número: ${appointment.phone}`;

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado exitosamente",
        description: "Datos listos para enviar por WhatsApp.",
      });
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if(!o) setIsEditing(false); onOpenChange(o); }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border custom-scrollbar p-0">
          <DialogHeader className="px-6 py-4 border-b border-border/40 relative">
            <div className="flex items-center justify-between h-7">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-headline font-bold text-foreground leading-none">
                  Detalles
                </DialogTitle>
                
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-default">
                        <Info className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover border-border shadow-xl">
                      <p className="text-[10px] font-mono uppercase tracking-widest">ID: {appointment.id}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {!isEditing && (
                <div className="flex items-center gap-3 mr-8">
                  <Button 
                    onClick={copyToWhatsAppFormat}
                    variant="outline" 
                    size="sm"
                    className="h-7 px-3 text-[10px] border-green-500/30 text-green-500 hover:bg-green-500/10 font-bold uppercase tracking-tight flex items-center justify-center"
                  >
                    <MessageCircle className="w-3 h-3 mr-1.5" />
                    Copiar datos
                  </Button>
                </div>
              )}
            </div>
            <DialogDescription className="sr-only">
              Información detallada y gestión del prospecto.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input 
                      type="date" 
                      value={editData.date ? parseISO(editData.date).toISOString().split('T')[0] : ''} 
                      onChange={e => setEditData({...editData, date: new Date(e.target.value + 'T12:00:00Z').toISOString()})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input type="time" value={editData.time || ''} onChange={e => setEditData({...editData, time: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={editData.type} onValueChange={v => setEditData({...editData, type: v as AppointmentType})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ra consulta">1ra consulta</SelectItem>
                        <SelectItem value="2da consulta">2da consulta</SelectItem>
                        <SelectItem value="cierre">Cierre</SelectItem>
                        <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={editData.status} onValueChange={v => setEditData({...editData, status: v as AppointmentStatus})}>
                      <SelectTrigger><SelectValue placeholder="Sin estado" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asistencia">Asistencia</SelectItem>
                        <SelectItem value="No asistencia">No asistencia</SelectItem>
                        <SelectItem value="Continuación en otra cita">Continuación en otra cita</SelectItem>
                        <SelectItem value="Reagendó">Reagendó</SelectItem>
                        <SelectItem value="Reembolso">Reembolso</SelectItem>
                        <SelectItem value="Cierre">Cierre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-muted/20 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Cliente</p>
                    <p className="text-sm font-semibold">{appointment.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Teléfono</p>
                    <p className="text-sm">{appointment.phone || 'No registrado'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Fecha</p>
                      <p className="text-sm font-medium">{format(parseISO(appointment.date), 'dd/MM/yyyy')}</p>
                      <p className="text-[10px] text-muted-foreground italic font-medium mt-0.5">{formatFriendlyDate(appointment.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Hora</p>
                      <p className="text-sm font-medium">{format12hTime(appointment.time)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-3">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Tipo</p>
                      <p className="text-sm">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Estado</p>
                      <p className="text-sm font-bold text-primary">{appointment.status || 'Pendiente'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                📝 Notas
              </Label>
              <Textarea 
                placeholder="Detalles importantes sobre este prospecto..."
                className="min-h-[140px] bg-muted/30 border-border/50 focus-visible:ring-accent resize-none custom-scrollbar text-sm leading-relaxed"
                value={isEditing ? editData.notes : appointment.notes}
                onChange={e => setEditData({...editData, notes: e.target.value})}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2 border-t border-border/50 px-6 py-4 bg-muted/10">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:bg-destructive/10 h-8 text-xs font-bold uppercase"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
            </Button>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                    <Save className="w-3.5 h-3.5 mr-2" /> Guardar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm" variant="secondary" className="font-bold">
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará toda la información y el historial de notas de <strong>{appointment.name}</strong> de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
