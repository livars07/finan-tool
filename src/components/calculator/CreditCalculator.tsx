"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calculator, RotateCcw, Info, UserCheck, HelpCircle, Maximize2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CreditCalculator() {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  
  const FACTOR_MENSUALIDAD = 0.006982; // 0.6982%
  const FACTOR_ENGANCHE = 0.03; // 3%
  const INCOME_RATIO = 0.35; // 35% de ingresos destinados a mensualidad

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const parseNumber = (val: string) => {
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  const formatWithCommas = (val: string) => {
    const num = val.replace(/,/g, '');
    if (!num || isNaN(Number(num))) return '';
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleTotalPriceChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setTotalPrice(cleanVal);
    const p = parseFloat(cleanVal);
    if (!isNaN(p)) {
      const c = p * FACTOR_MENSUALIDAD;
      setMonthlyPayment(c.toFixed(2));
    }
  };

  const handleMonthlyPaymentChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setMonthlyPayment(cleanVal);
    const c = parseFloat(cleanVal);
    if (!isNaN(c)) {
      const p = c / FACTOR_MENSUALIDAD;
      setTotalPrice(p.toFixed(2));
    }
  };

  const clear = () => {
    setTotalPrice('');
    setMonthlyPayment('');
  };

  const currentP = parseNumber(totalPrice);
  const currentDownPayment = currentP * FACTOR_ENGANCHE;
  const currentMonthly = parseNumber(monthlyPayment);
  
  const minIncomeRequired = currentMonthly / INCOME_RATIO;

  return (
    <Card className="shadow-2xl bg-card border-border overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="text-primary w-6 h-6" />
              <CardTitle className="text-xl font-headline font-semibold">Calculadora rápida</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    <HelpCircle className="w-4 h-4 cursor-help" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] p-4 text-xs backdrop-blur-xl bg-card/80 border-border/30">
                  <p className="font-semibold mb-1">Modelo de Negocio:</p>
                  <ul className="space-y-1 list-disc pl-3">
                    <li>Enganche: 3%</li>
                    <li>Mensualidad: 0.6982% del Valor P</li>
                    <li>Interés: 7% Anual</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 cursor-default"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-muted-foreground">
          Plazo 192 meses - Plan Tradicional 12pp
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalPrice" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Precio del Inmueble (P)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="totalPrice"
                placeholder="0.00"
                className="pl-7 font-semibold text-lg bg-muted/20"
                type="text"
                value={formatWithCommas(totalPrice)}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyPayment" className="text-xs font-bold text-accent uppercase tracking-wider">Mensualidad (0.6982%)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-accent font-bold">$</span>
              <Input
                id="monthlyPayment"
                placeholder="0.00"
                className="pl-7 border-accent/30 focus-visible:ring-accent font-bold text-lg text-accent bg-accent/5"
                type="text"
                value={formatWithCommas(monthlyPayment)}
                onChange={(e) => handleMonthlyPaymentChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border/50 backdrop-blur-sm">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-primary">Enganche: 3%</span>
            <span className="text-[10px] font-bold text-primary">{formatCurrency(currentDownPayment)}</span>
          </div>
          <Progress value={3} className="h-2 bg-primary/20" />
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground pt-1">
            <span>Inmueble: {formatCurrency(currentP)}</span>
            <span>Financiamiento: 97%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-2 rounded-lg">
              <UserCheck className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-accent uppercase font-bold flex items-center gap-1">
                Ingreso Mensual Recomendado
              </span>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(minIncomeRequired)}
              </p>
              <p className="text-[10px] text-muted-foreground leading-none">
                * Para mantener un perfil de riesgo saludable (35% dti).
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-muted border border-border/50">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">
              Factor mensualidad: 0.6982%
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-destructive h-8 px-2">
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reiniciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
