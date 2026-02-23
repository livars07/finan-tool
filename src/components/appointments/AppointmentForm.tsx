"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppointmentType } from '@/hooks/use-appointments';

interface AppointmentFormProps {
  onAdd: (app: { name: string; phone: string; date: string; time: string; type: AppointmentType }) => void;
}

export default function AppointmentForm({ onAdd }: AppointmentFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('1ra consulta');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !time) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    onAdd({ name, phone, date: new Date(date).toISOString(), time, type });
    setName('');
    setPhone('');
    setDate('');
    setTime('');
    setType('1ra consulta');
    toast({
      title: "Cita agregada",
      description: `Cita de ${type} para ${name} registrada.`,
    });
  };

  return (
    <Card className="bg-card border-border shadow-md backdrop-blur-xl">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <UserPlus className="text-accent w-5 h-5" />
          <CardTitle className="text-lg font-headline">Nueva cita rápida</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1 space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Número" className="bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Motivo</Label>
            <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
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
          <Button type="submit" className="bg-accent hover:bg-accent/80 text-accent-foreground font-semibold shadow-lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}