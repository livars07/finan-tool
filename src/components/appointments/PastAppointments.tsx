
"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus, AppointmentType } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ChevronDown, Trash2, Pencil } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppointments } from '@/hooks/use-appointments';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointments: Appointment[];
  updateStatus: (id: string, status: AppointmentStatus) => void;
}

export default function PastAppointments({ appointments, updateStatus }: Props) {
  const { deleteAppointment, editAppointment } = useAppointments();
  const [visibleCount, setVisibleCount] = useState(20);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editApp, setEditApp] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editApp) {
      editAppointment(editApp.id, editApp);
      setEditApp(null);
      toast({ title: "Registro Actualizado", description: "Los cambios han sido guardados." });
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
        <p>No hay registro de citas pasadas.</p>
      </div>
    );
  }

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status) {
      case 'Venta': return 'text-green-400 font-bold';
      case 'Canceló': return 'text-destructive';
      case 'Reagendó': return 'text-primary';
      case 'Cita Exitosa': return 'text-accent';
      default: return '';
    }
  };

  const visibleAppointments = appointments.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden bg-card relative">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead>Nombre / Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAppointments.map((app) => (
                <TableRow key={app.id} className="hover:bg-muted/30 relative group">
                  <TableCell>
                    <div className="font-medium text-sm">{app.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{app.type}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(parseISO(app.date), 'dd/MM/yyyy')} {app.time}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={app.status || 'Cita Exitosa'}
                      onValueChange={(val) => updateStatus(app.id, val as AppointmentStatus)}
                    >
                      <SelectTrigger className={`w-[140px] h-7 text-xs bg-transparent border-border/50 ${getStatusColor(app.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reagendó">Reagendó</SelectItem>
                        <SelectItem value="Canceló">Canceló</SelectItem>
                        <SelectItem value="Venta">Venta</SelectItem>
                        <SelectItem value="Cita Exitosa">Cita Exitosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="relative">
                    <div className="flex flex-col gap-1 absolute right-2 top-2 z-20">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="w-6 h-6 rounded-sm"
                        onClick={() => setDeleteId(app.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="w-6 h-6 rounded-sm bg-muted text-muted-foreground hover:bg-muted/80"
                        onClick={() => setEditApp(app)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {visibleCount < appointments.length && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setVisibleCount(p => p + 20)}
            className="text-xs border-dashed hover:bg-primary/10"
          >
            <ChevronDown className="mr-2 h-3 w-3" /> Cargar 20 más
          </Button>
        </div>
      )}

      {/* Alertas y Diálogos */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este registro histórico?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteAppointment(deleteId);
                  setDeleteId(null);
                  toast({ title: "Registro eliminado", description: "La cita ha sido removida del historial." });
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editApp} onOpenChange={() => setEditApp(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Historial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre del Cliente</Label>
              <Input 
                value={editApp?.name || ''} 
                onChange={e => setEditApp(prev => prev ? {...prev, name: e.target.value} : null)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input 
                  type="date"
                  value={editApp?.date ? parseISO(editApp.date).toISOString().split('T')[0] : ''} 
                  onChange={e => setEditApp(prev => prev ? {...prev, date: new Date(e.target.value).toISOString()} : null)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input 
                  type="time"
                  value={editApp?.time || ''} 
                  onChange={e => setEditApp(prev => prev ? {...prev, time: e.target.value} : null)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado de la Cita</Label>
              <Select 
                value={editApp?.status} 
                onValueChange={v => setEditApp(prev => prev ? {...prev, status: v as AppointmentStatus} : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reagendó">Reagendó</SelectItem>
                  <SelectItem value="Canceló">Canceló</SelectItem>
                  <SelectItem value="Venta">Venta</SelectItem>
                  <SelectItem value="Cita Exitosa">Cita Exitosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditApp(null)}>Cancelar</Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
