"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppointmentFormProps {
  onAdd: (app: { name: string; phone: string; date: string; time: string }) => void;
}

export default function AppointmentForm({ onAdd }: AppointmentFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
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
    onAdd({ name, phone, date: new Date(date).toISOString(), time });
    setName('');
    setPhone('');
    setDate('');
    setTime('');
    toast({
      title: "Cita Agregada",
      description: `Cita para ${name} registrada con éxito.`,
    });
  };

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <UserPlus className="text-accent w-5 h-5" />
          <CardTitle className="text-lg font-headline">Nueva Cita Rápida</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Ana García" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Número</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="55 0000 0000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <Button type="submit" className="bg-accent hover:bg-accent/80 text-accent-foreground font-semibold">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Cita
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}