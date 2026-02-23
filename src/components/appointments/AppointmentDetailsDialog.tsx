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
import { Appointment } from '@/services/appointment-service';
import { User, Phone, Calendar, Clock, Edit2, Save, MessageCircle, Info } from 'lucide-react';
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

  const copyToWhatsAppFormat = () => {
    const dateObj = parseISO(appointment.date);
    const dateFormatted = format(dateObj, "EEEE d 'de' MMMM yyyy", { locale: es });
    const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    const timeFormatted = format12hTime(appointment.time);

    const text = `Cita: ${capitalizedDate}
Nombre: ${appointment.name}
Producto: Crédito Hipotecario
Hora: ${timeFormatted}
Número: ${appointment.phone}`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copiado", description: "Datos listos para WhatsApp." });
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { 
      if(!o) {
        setIsEditing(false);
        forceDOMCleanup();
      } 
      onOpenChange(o); 
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border p-0 shadow-2xl backdrop-blur-3xl">
        <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between">
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
                className="h-8 px-3 text-[10px] border-green-500/30 text-green-500 hover:bg-green-500/10 font-bold uppercase"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Copiar
              </Button>
            )}
            <DialogClose className="h-8 w-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive transition-colors group">
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
                  <p className="text-sm">{appointment.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Fecha</p>
                    <p className="text-sm font-medium">{formatFriendlyDate(appointment.date)}</p>
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
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase">📝 Notas</Label>
            <Textarea 
              placeholder="Detalles del prospecto..."
              className="min-h-[120px] bg-muted/30 border-border/50 focus-visible:ring-primary resize-none"
              value={isEditing ? editData.notes : appointment.notes}
              onChange={e => setEditData({...editData, notes: e.target.value})}
              readOnly={!isEditing}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end items-center gap-2 border-t border-border/50 px-6 py-4 bg-muted/10">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground font-bold">
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
  );
}