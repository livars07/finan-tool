"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentType } from '@/hooks/use-appointments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Info } from "lucide-react";
import { isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointments: Appointment[];
  formatDate: (date: string) => string;
  deleteAppointment: (id: string) => void;
  editAppointment: (id: string, updatedData: Partial<Appointment>) => void;
}

export default function UpcomingAppointments({ appointments, formatDate, deleteAppointment, editAppointment }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editApp, setEditApp] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editApp) {
      editAppointment(editApp.id, editApp);
      setEditApp(null);
      toast({ title: "Cita Actualizada", description: "Los cambios han sido guardados." });
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <Calendar className="w-12 h-12 mb-2 opacity-20" />
        <p>No hay citas programadas.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden relative">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((app) => {
            const isAppToday = isToday(parseISO(app.date));
            return (
              <TableRow 
                key={app.id} 
                className={cn(
                  "hover:bg-primary/5 transition-colors group relative",
                  isAppToday && "bg-primary/10 border-l-4 border-l-primary"
                )}
              >
                <TableCell className="font-medium">
                  {app.name}
                  {isAppToday && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase animate-pulse">
                      Hoy
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Info className="w-3 h-3" /> {app.type}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={isAppToday ? "default" : "secondary"} className="font-normal">
                    {formatDate(app.date)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-accent font-bold">
                    <Clock className="w-3 h-3" /> {app.time}
                  </div>
                </TableCell>
                <TableCell className="p-0">
                  <div className="flex flex-col gap-1.5 absolute right-2 top-2 z-20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-3 h-3 rounded-full bg-destructive hover:bg-destructive/80 p-0 border-none shadow-none"
                      onClick={() => setDeleteId(app.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-3 h-3 rounded-full bg-accent hover:bg-accent/80 p-0 border-none shadow-none"
                      onClick={() => setEditApp(app)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cita?</AlertDialogTitle>
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
                  toast({ title: "Eliminado", description: "La cita ha sido removida." });
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
            <DialogTitle>Editar Cita</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre del Cliente</Label>
              <Input 
                value={editApp?.name || ''} 
                onChange={e => setEditApp(prev => prev ? {...prev, name: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input 
                value={editApp?.phone || ''} 
                onChange={e => setEditApp(prev => prev ? {...prev, phone: e.target.value} : null)} 
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
              <Label>Tipo de Cita</Label>
              <Select 
                value={editApp?.type} 
                onValueChange={v => setEditApp(prev => prev ? {...prev, type: v as AppointmentType} : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1er consulta">1er consulta</SelectItem>
                  <SelectItem value="2da consulta">2da consulta</SelectItem>
                  <SelectItem value="cierre">cierre</SelectItem>
                  <SelectItem value="asesoria post-venta">asesoría post-venta</SelectItem>
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
