
"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw, Info, Landmark } from "lucide-react";

export default function CreditCalculator() {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [annualRate, setAnnualRate] = useState<string>('7');
  const [termMonths, setTermMonths] = useState<string>('192');

  const FACTOR_MENSUALIDAD = 0.006982; // 0.6982%
  const FACTOR_ENGANCHE = 0.03; // 3%

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
      const e = p * FACTOR_ENGANCHE;
      const c = p * FACTOR_MENSUALIDAD;
      setDownPayment(e.toFixed(2));
      setMonthlyPayment(c.toFixed(2));
    }
  };

  const handleDownPaymentChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setDownPayment(cleanVal);
    // En este modelo, el enganche no afecta la mensualidad ya que esta se basa en el precio total (P)
  };

  const handleMonthlyPaymentChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setMonthlyPayment(cleanVal);
    const c = parseFloat(cleanVal);
    if (!isNaN(c)) {
      // Inversa: P = C / FACTOR
      const p = c / FACTOR_MENSUALIDAD;
      const e = p * FACTOR_ENGANCHE;
      setTotalPrice(p.toFixed(2));
      setDownPayment(e.toFixed(2));
    }
  };

  const clear = () => {
    setTotalPrice('');
    setDownPayment('');
    setMonthlyPayment('');
  };

  const totalCreditCost = parseNumber(monthlyPayment) * parseNumber(termMonths) + parseNumber(downPayment);

  return (
    <Card className="shadow-2xl bg-card border-border overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Calculator className="text-primary w-6 h-6" />
          <CardTitle className="text-xl font-headline font-semibold">Calculadora de Crédito</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Modelo Preferencial: 7% Anual | 3% Enganche | Mensualidad fija (0.6982% de P)
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
          <div className="space-y-2">
            <Label htmlFor="downPayment" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enganche Requerido (3%)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="downPayment"
                placeholder="0.00"
                className="pl-7 bg-muted/20"
                type="text"
                value={formatWithCommas(downPayment)}
                onChange={(e) => handleDownPaymentChange(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 flex items-start gap-2">
              <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-tight">
                La mensualidad se calcula directamente sobre el valor total del inmueble sin considerar el enganche como reducción del capital para este factor.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Monto a Financiar</span>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(parseNumber(totalPrice) - parseNumber(downPayment))}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Plazo Contratado</span>
            <p className="text-lg font-bold text-foreground">{termMonths} Meses</p>
          </div>
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-border/50 pt-2 md:pt-0 md:pl-4">
            <span className="text-[10px] text-primary uppercase font-bold flex items-center gap-1">
              <Landmark className="w-3 h-3" /> Costo Total Estimado
            </span>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(totalCreditCost)}
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-muted-foreground italic italic">
            * Valores informativos basados en tasa del {annualRate}% anual.
          </p>
          <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-destructive">
            <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Calculadora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
