"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppointmentType, AppointmentProduct } from '@/services/appointment-service';
import { cn } from "@/lib/utils";

interface AppointmentFormProps {
  onAdd: (app: { name: string; phone: string; date: string; time: string; type: AppointmentType; product: AppointmentProduct }) => void;
}

export default function AppointmentForm({ onAdd }: AppointmentFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('1ra consulta');
  const [product, setProduct] = useState<AppointmentProduct>('Casa');
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
    
    const isoDate = new Date(date + 'T12:00:00Z').toISOString();
    
    onAdd({ name, phone, date: isoDate, time, type, product });
    setName('');
    setPhone('');
    setDate('');
    setTime('');
    setType('1ra consulta');
    setProduct('Casa');
    toast({
      title: "Cita agregada",
      description: `Cita de ${type} para ${name} registrada.`,
    });
  };

  return (
    <Card className="bg-card border-border shadow-md backdrop-blur-lg">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <UserPlus className="text-accent w-5 h-5" />
          <CardTitle className="text-lg font-headline">Nueva Cita</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground/70">Nombre</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Escribe el nombre..." 
                className="bg-muted/30 border-border/40 text-sm placeholder:text-muted-foreground/40 h-11 w-full" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs uppercase font-bold text-muted-foreground/70">Teléfono</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Ej. 664 123 4567" 
                className="bg-muted/30 border-border/40 text-sm placeholder:text-muted-foreground/40 h-11 w-full" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs uppercase font-bold text-muted-foreground/70">Fecha</Label>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className={cn(
                  "bg-muted/30 border-border/40 text-sm h-11 w-full",
                  !date && "text-muted-foreground/40"
                )} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-xs uppercase font-bold text-muted-foreground/70">Hora</Label>
              <Input 
                id="time" 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className={cn(
                  "bg-muted/30 border-border/40 text-sm h-11 w-full",
                  !time && "text-muted-foreground/40"
                )} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-2">
              <Label htmlFor="type" className="text-xs uppercase font-bold text-muted-foreground/70">Motivo de la Consulta</Label>
              <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
                <SelectTrigger className="bg-muted/30 border-border/40 h-11 text-sm w-full text-muted-foreground/60">
                  <SelectValue placeholder="Selecciona el motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ra consulta">1ra consulta</SelectItem>
                  <SelectItem value="2da consulta">2da consulta</SelectItem>
                  <SelectItem value="cierre">Cierre</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label htmlFor="product" className="text-xs uppercase font-bold text-muted-foreground/70">Producto</Label>
              <Select value={product} onValueChange={(v) => setProduct(v as AppointmentProduct)}>
                <SelectTrigger className="bg-muted/30 border-border/40 h-11 text-sm w-full text-muted-foreground/60">
                  <SelectValue placeholder="Selecciona el producto" />
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
            <div className="md:col-span-3">
              <Button 
                type="submit" 
                className="bg-accent hover:bg-accent/80 text-accent-foreground font-bold shadow-lg h-11 flex items-center justify-center gap-2 w-full"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Registrar</span>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
