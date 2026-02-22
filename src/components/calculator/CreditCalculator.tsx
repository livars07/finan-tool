
"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calculator, RotateCcw, Info, Landmark, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CreditCalculator() {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  
  const FACTOR_MENSUALIDAD = 0.006982; // 0.6982%
  const FACTOR_ENGANCHE = 0.03; // 3%
  const TERM_MONTHS = 192;

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
  const totalCreditCost = (currentMonthly * TERM_MONTHS) + currentDownPayment;

  return (
    <Card className="shadow-2xl bg-card border-border overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="text-primary w-6 h-6" />
            <CardTitle className="text-xl font-headline font-semibold">Calculadora Pro</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-5 h-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] p-4">
                <p className="text-xs font-semibold mb-1">Fórmula de Costo Total:</p>
                <p className="text-[10px] text-muted-foreground">
                  (Mensualidad × 192) + Enganche (3%)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-muted-foreground">
          Interés: 7% Anual | Plazo: 192 Meses
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
                className="pl-7 font-semibold text-lg"
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
                className="pl-7 border-accent/30 focus-visible:ring-accent font-bold text-lg text-accent"
                type="text"
                value={formatWithCommas(monthlyPayment)}
                onChange={(e) => handleMonthlyPaymentChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* New Functional Addition: Funding Breakdown Visualization */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Estructura del Crédito</span>
            <span className="text-[10px] font-bold text-primary">97% FINANCIAMIENTO</span>
          </div>
          <Progress value={97} className="h-2 bg-accent/20" />
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground pt-1">
            <span>Enganche: {formatCurrency(currentDownPayment)} (3%)</span>
            <span>Financiado: {formatCurrency(currentP - currentDownPayment)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-primary uppercase font-bold flex items-center gap-1">
                <Landmark className="w-3 h-3" /> Costo Total Estimado
              </span>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalCreditCost)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Plazo</span>
              <p className="text-lg font-bold text-foreground">{TERM_MONTHS} Meses</p>
            </div>
          </div>
          <div className="border-t border-primary/20 pt-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              * El costo total incluye el enganche de {formatCurrency(currentDownPayment)} y el total de {TERM_MONTHS} pagos fijos de {formatCurrency(currentMonthly)}.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-accent/10 border border-accent/20">
            <Info className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] text-accent font-semibold uppercase tracking-tighter">
              Cálculo: (Mensualidad × {TERM_MONTHS}) + Enganche
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
