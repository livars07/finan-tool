"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  RotateCcw, 
  Info, 
  UserCheck, 
  HelpCircle, 
  Maximize2, 
  Copy, 
  X, 
  FileText, 
  ShieldAlert, 
  TrendingUp,
  Receipt,
  ArrowRightLeft,
  Coins
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CalculatorInputs = ({ 
  isModal = false, 
  totalPrice, 
  monthlyPayment, 
  onPriceChange, 
  onMonthlyChange,
  formatWithCommas
}: { 
  isModal?: boolean,
  totalPrice: string,
  monthlyPayment: string,
  onPriceChange: (val: string) => void,
  onMonthlyChange: (val: string) => void,
  formatWithCommas: (val: string) => string
}) => (
  <div className={isModal ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
    <div className="space-y-2">
      <Label htmlFor={isModal ? "totalPriceModal" : "totalPrice"} className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Monto del crédito (P)
      </Label>
      <div className="relative flex items-center">
        <span className={cn(
          "absolute left-3 font-bold pointer-events-none",
          isModal ? "text-2xl text-muted-foreground top-1/2 -translate-y-1/2" : "text-muted-foreground top-2.5"
        )}>$</span>
        <Input
          id={isModal ? "totalPriceModal" : "totalPrice"}
          placeholder="0.00"
          className={isModal ? "pl-9 font-bold text-3xl bg-muted/20 h-16" : "pl-7 font-semibold text-lg bg-muted/20"}
          type="text"
          value={formatWithCommas(totalPrice)}
          onChange={(e) => onPriceChange(e.target.value)}
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor={isModal ? "monthlyPaymentModal" : "monthlyPayment"} className="text-xs font-bold text-accent uppercase tracking-wider">
        Mensualidad (0.6982%)
      </Label>
      <div className="relative flex items-center">
        <span className={cn(
          "absolute left-3 font-bold pointer-events-none",
          isModal ? "text-2xl text-accent top-1/2 -translate-y-1/2" : "text-accent top-2.5"
        )}>$</span>
        <Input
          id={isModal ? "monthlyPaymentModal" : "monthlyPayment"}
          placeholder="0.00"
          className={isModal ? "pl-9 border-accent/30 focus-visible:ring-accent font-bold text-3xl text-accent bg-accent/5 h-16" : "pl-7 border-accent/30 focus-visible:ring-accent font-bold text-lg text-accent bg-accent/5"}
          type="text"
          value={formatWithCommas(monthlyPayment)}
          onChange={(e) => onMonthlyChange(e.target.value)}
        />
      </div>
    </div>
  </div>
);

export default function CreditCalculator() {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  const FACTOR_MENSUALIDAD = 0.006982; 
  const FACTOR_ENGANCHE = 0.03; 
  const INCOME_RATIO = 0.35; 

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
  
  // Gastos y saldos adicionales solicitados
  const estimatedClosingCosts = currentP * 0.05;
  const appraisalCost = 7500;
  const totalOperatingExpenses = estimatedClosingCosts + appraisalCost;
  const netLiquidCredit = currentP > 0 ? currentP - totalOperatingExpenses : 0;
  const estimatedPropertyValue = currentP > 0 ? currentP / 0.97 : 0;
  const suggestedLivingBudget = minIncomeRequired > 0 ? minIncomeRequired - currentMonthly : 0;

  const handleCopySummary = () => {
    if (currentP <= 0) {
      toast({
        title: "Calculadora vacía",
        description: "Ingresa un monto para copiar el resumen.",
        variant: "destructive"
      });
      return;
    }

    const summaryText = `Resumen de cotización de financiamiento inmobiliario:
• Monto crédito: ${formatCurrency(currentP)}
• Enganche (3%): ${formatCurrency(currentDownPayment)}
• Mensualidad: ${formatCurrency(currentMonthly)}
• Ingreso mínimo: ${formatCurrency(minIncomeRequired)}
* Sujeto a aprobación de crédito y perfilamiento.`;

    navigator.clipboard.writeText(summaryText).then(() => {
      toast({
        title: "Resumen copiado",
        description: "Datos listos para enviar al interesado.",
      });
    });
  };

  return (
    <>
      <Card className="shadow-2xl bg-card border-border overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                    <p className="font-semibold mb-1">Modelo de negocio:</p>
                    <ul className="space-y-1 list-disc pl-3">
                      <li>Enganche: 3%</li>
                      <li>Mensualidad: 0.6982% del valor P</li>
                      <li>Plazo: 192 meses</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-muted-foreground">
            Plan Tradicional 12pp - Financiamiento Inmobiliario
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <CalculatorInputs 
            totalPrice={totalPrice}
            monthlyPayment={monthlyPayment}
            onPriceChange={handleTotalPriceChange}
            onMonthlyChange={handleMonthlyPaymentChange}
            formatWithCommas={formatWithCommas}
          />

          <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border/50 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-primary">Enganche requerido (3%)</span>
              <span className="text-[10px] font-bold text-primary">{formatCurrency(currentDownPayment)}</span>
            </div>
            <Progress value={3} className="h-2 bg-primary/20" />
            <div className="flex justify-between text-[10px] font-medium text-muted-foreground pt-1">
              <span>Crédito: {formatCurrency(currentP)}</span>
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
                  Ingreso mensual recomendado
                </span>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(minIncomeRequired)}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none">
                  * Basado en un ratio de endeudamiento del 35%.
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

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent 
          data-calculator-dialog="true"
          className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none shadow-none p-0 flex flex-col overflow-hidden"
        >
          <DialogHeader className="px-10 py-6 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30">
                <Calculator className="text-primary w-8 h-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-headline font-bold text-foreground">Simulador Profesional de Crédito</DialogTitle>
                <DialogDescription className="text-sm">Herramienta técnica para el perfilamiento inmobiliario y control de expedientes.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-12 w-12">
                <X className="w-6 h-6" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-10 space-y-10">
            <section className="bg-muted/30 p-10 rounded-3xl border border-border/50 shadow-inner">
              <CalculatorInputs 
                isModal={true}
                totalPrice={totalPrice}
                monthlyPayment={monthlyPayment}
                onPriceChange={handleTotalPriceChange}
                onMonthlyChange={handleMonthlyPaymentChange}
                formatWithCommas={formatWithCommas}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
              <div className="space-y-6">
                <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 space-y-6 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-primary">
                    <TrendingUp className="w-6 h-6" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Estructura del Financiamiento</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Monto del crédito solicitado:</span>
                      <span className="font-bold">{formatCurrency(currentP)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Valor comercial estimado:</span>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground/60 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px] p-4 text-sm bg-popover border-border backdrop-blur-xl">
                              <p>Estimación del valor del inmueble basándose en que el crédito otorgado representa el 97% del costo total de adquisición.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="font-bold text-primary">{formatCurrency(estimatedPropertyValue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Enganche requerido (3%):</span>
                      <span className="font-bold">{formatCurrency(currentDownPayment)}</span>
                    </div>
                    <div className="pt-6 border-t border-border/30">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">Inversión Mensual Fija</span>
                      <p className="text-4xl font-bold text-primary mt-1">{formatCurrency(currentMonthly)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 rounded-3xl border border-accent/20 bg-accent/5 space-y-6 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-accent">
                    <Receipt className="w-6 h-6" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Gastos y Saldos Líquidos</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Gastos de escrituración (est. 5%):</span>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground/60 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[350px] p-6 text-base leading-relaxed bg-popover border-border shadow-2xl backdrop-blur-xl">
                              <p className="font-bold mb-2 text-primary text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5" /> ¿Qué es la escrituración?
                              </p>
                              <p>Cubre la legalidad del patrimonio ante notario e impuestos estatales. Es la inversión que garantiza la propiedad al 100%.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="font-bold">{formatCurrency(estimatedClosingCosts)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Costo de avalúo pericial:</span>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground/60 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[350px] p-6 text-base leading-relaxed bg-popover border-border shadow-2xl backdrop-blur-xl">
                              <p className="font-bold mb-2 text-accent text-lg flex items-center gap-2">
                                <Info className="w-5 h-5" /> ¿Por qué el avalúo?
                              </p>
                              <p>Certificación oficial del valor real de la propiedad por un perito autorizado para proteger su inversión.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="font-bold">{formatCurrency(appraisalCost)}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-border/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">Desembolso inicial total</span>
                        <span className="text-lg font-bold text-accent">{formatCurrency(currentDownPayment + totalOperatingExpenses)}</span>
                      </div>
                      <div className="bg-accent/10 p-3 rounded-xl border border-accent/20">
                        <div className="flex items-center gap-2 text-accent mb-1">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Monto líquido restante</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(netLiquidCredit)}</p>
                        <p className="text-[9px] text-muted-foreground mt-1 italic">
                          Capital disponible tras cubrir gastos operativos del crédito.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="p-8 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 space-y-6 flex-1">
                  <div className="flex items-center gap-3 text-yellow-500">
                    <ShieldAlert className="w-6 h-6" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Perfilamiento Operativo</h4>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Ingreso mínimo comprobable</p>
                      <p className="text-3xl font-bold text-foreground">{formatCurrency(minIncomeRequired)}</p>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-2 text-yellow-500 mb-1">
                        <Coins className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Presupuesto de vida sugerido</span>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(suggestedLivingBudget)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Capital libre mensual proyectado tras pago de mensualidad.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-bold">
                        <span>Ratio de endeudamiento sano</span>
                        <span>35% DTI</span>
                      </div>
                      <Progress value={35} className="h-2 bg-yellow-500/20" />
                      <p className="text-[10px] text-muted-foreground leading-snug">El ingreso mensual debe ser al menos 2.8 veces mayor a la mensualidad para una aprobación técnica saludable.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-4 border-t border-border/20 items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 p-3 px-5 rounded-2xl bg-muted border border-border/50">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Plan Tradicional 192 Meses</span>
                </div>
                <div className="text-xs text-muted-foreground/60 leading-tight hidden xl:block">
                  * Proyección informativa basada en factor mensualidad fijo de 0.6982%. <br />
                  Sujeto a cambios según perfil crediticio e institución financiera.
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button 
                  onClick={handleCopySummary}
                  variant="outline"
                  className="flex-1 md:flex-none h-14 px-8 border-green-500 text-green-500 hover:bg-green-500/5 font-bold text-lg rounded-2xl transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" /> Copiar Resumen
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={clear}
                  className="h-14 px-6 text-muted-foreground hover:text-destructive rounded-2xl"
                >
                  <RotateCcw className="w-5 h-5 mr-2" /> Limpiar Todo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
