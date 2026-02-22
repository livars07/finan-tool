
"use client"

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw } from "lucide-react";

export default function CreditCalculator() {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [annualRate, setAnnualRate] = useState<string>('7');
  const [termMonths, setTermMonths] = useState<string>('192');
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>('3');

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

  const calculateFrenchPayment = useCallback((monto: number, tasaAnual: number, meses: number) => {
    if (monto <= 0) return 0;
    const r = tasaAnual / 12 / 100;
    if (r === 0) return monto / meses;
    return (monto * r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1);
  }, []);

  const calculateFrenchLoanAmount = useCallback((pago: number, tasaAnual: number, meses: number) => {
    if (pago <= 0) return 0;
    const r = tasaAnual / 12 / 100;
    if (r === 0) return pago * meses;
    return (pago * (Math.pow(1 + r, meses) - 1)) / (r * Math.pow(1 + r, meses));
  }, []);

  const handleTotalPriceChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setTotalPrice(cleanVal);
    const p = parseFloat(cleanVal);
    if (!isNaN(p)) {
      const ePercent = parseFloat(downPaymentPercent) / 100 || 0.03;
      const e = p * ePercent;
      const m = p - e;
      const c = calculateFrenchPayment(m, parseFloat(annualRate), parseInt(termMonths));
      setDownPayment(e.toFixed(2));
      setMonthlyPayment(c.toFixed(2));
    }
  };

  const handleDownPaymentChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setDownPayment(cleanVal);
    const e = parseFloat(cleanVal);
    const p = parseFloat(totalPrice);
    if (!isNaN(e) && !isNaN(p)) {
      const m = p - e;
      const c = calculateFrenchPayment(m, parseFloat(annualRate), parseInt(termMonths));
      setMonthlyPayment(c.toFixed(2));
    }
  };

  const handleMonthlyPaymentChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setMonthlyPayment(cleanVal);
    const c = parseFloat(cleanVal);
    if (!isNaN(c)) {
      const m = calculateFrenchLoanAmount(c, parseFloat(annualRate), parseInt(termMonths));
      let e = parseFloat(downPayment);
      if (isNaN(e) || e === 0) {
        const p = m / 0.97;
        e = p * 0.03;
        setTotalPrice(p.toFixed(2));
        setDownPayment(e.toFixed(2));
      } else {
        const p = m + e;
        setTotalPrice(p.toFixed(2));
      }
    }
  };

  const clear = () => {
    setTotalPrice('');
    setDownPayment('');
    setMonthlyPayment('');
  };

  return (
    <Card className="shadow-2xl bg-card border-border overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Calculator className="text-primary w-6 h-6" />
          <CardTitle className="text-xl font-headline font-semibold">Calculadora de Crédito</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">Sistema francés (7% Anual | 3% Enganche | Mensualidad 0.6982%)</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalPrice">Precio Total del Inmueble (P)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="totalPrice"
                placeholder="0.00"
                className="pl-7"
                type="text"
                value={formatWithCommas(totalPrice)}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="downPayment">Enganche (E)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="downPayment"
                placeholder="0.00"
                className="pl-7"
                type="text"
                value={formatWithCommas(downPayment)}
                onChange={(e) => handleDownPaymentChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Mensualidad (C)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-accent">$</span>
              <Input
                id="monthlyPayment"
                placeholder="0.00"
                className="pl-7 border-accent/30 focus-visible:ring-accent"
                type="text"
                value={formatWithCommas(monthlyPayment)}
                onChange={(e) => handleMonthlyPaymentChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
             <Label htmlFor="downPaymentPercent">% Enganche sugerido</Label>
             <div className="relative">
               <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
               <Input
                 id="downPaymentPercent"
                 type="number"
                 value={downPaymentPercent}
                 onChange={(e) => setDownPaymentPercent(e.target.value)}
               />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border border-border/50">
          <div className="space-y-2">
            <Label htmlFor="annualRate">Tasa Anual (%)</Label>
            <Input
              id="annualRate"
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="termMonths">Plazo (meses, máx 192)</Label>
            <Input
              id="termMonths"
              type="number"
              max="192"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Financiamiento estimado</span>
            <span className="text-2xl font-headline font-bold text-primary">
              {formatCurrency(parseNumber(totalPrice) - parseNumber(downPayment))}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={clear} className="w-full md:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" /> Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
