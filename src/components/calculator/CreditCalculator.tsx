"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
  Coins,
  Settings2
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

interface CreditCalculatorProps {
  initialExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

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
  <div className={isModal ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
    <div className="space-y-2">
      <Label htmlFor={isModal ? "totalPriceModal" : "totalPrice"} className="text-xs font-bold text-primary uppercase tracking-wider">
        Monto del crédito (P)
      </Label>
      <div className="relative flex items-center">
        <span className={cn(
          "absolute left-3 font-bold pointer-events-none",
          isModal ? "text-xl text-primary top-1/2 -translate-y-1/2" : "text-primary top-2.5"
        )}>$</span>
        <Input
          id={isModal ? "totalPriceModal" : "totalPrice"}
          placeholder="0.00"
          className={isModal ? "pl-9 font-bold text-2xl bg-primary/5 border-primary/30 focus-visible:ring-primary h-14" : "pl-7 font-semibold text-lg bg-primary/5 border-primary/30 focus-visible:ring-primary"}
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
          isModal ? "text-xl text-accent top-1/2 -translate-y-1/2" : "text-accent top-2.5"
        )}>$</span>
        <Input
          id={isModal ? "monthlyPaymentModal" : "monthlyPayment"}
          placeholder="0.00"
          className={isModal ? "pl-9 border-accent/30 focus-visible:ring-accent font-bold text-2xl text-accent bg-accent/5 h-14" : "pl-7 border-accent/30 focus-visible:ring-accent font-bold text-lg text-accent bg-accent/5"}
          type="text"
          value={formatWithCommas(monthlyPayment)}
          onChange={(e) => onMonthlyChange(e.target.value)}
        />
      </div>
    </div>
  </div>
);

export default function CreditCalculator({ initialExpanded = false, onExpandedChange }: CreditCalculatorProps) {
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  
  // Advanced simulation states (Expanded only)
  const [extraDownPayment, setExtraDownPayment] = useState<string>('');
  const [extraMonthlyContribution, setExtraMonthlyContribution] = useState<string>('');
  const [customTerm, setCustomTerm] = useState<string>('192');

  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const { toast } = useToast();
  
  const DEFAULT_FACTOR = 0.006982; 
  const FACTOR_ENGANCHE = 0.03; 
  const INCOME_RATIO = 0.35; 

  useEffect(() => {
    if (initialExpanded) {
      setIsExpanded(true);
    }
  }, [initialExpanded]);

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  useEffect(() => {
    if (isExpanded) {
      window.history.pushState(null, '', '/simulador');
    } else {
      if (window.location.pathname === '/simulador') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [isExpanded]);

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
      const c = p * DEFAULT_FACTOR;
      setMonthlyPayment(c.toFixed(2));
    }
  };

  const handleMonthlyPaymentChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    setMonthlyPayment(cleanVal);
    const c = parseFloat(cleanVal);
    if (!isNaN(c)) {
      const p = c / DEFAULT_FACTOR;
      setTotalPrice(p.toFixed(2));
    }
  };

  const clear = () => {
    setTotalPrice('');
    setMonthlyPayment('');
    setExtraDownPayment('');
    setExtraMonthlyContribution('');
    setCustomTerm('192');
  };

  // Calculations
  const currentP = parseNumber(totalPrice);
  const extraDown = parseNumber(extraDownPayment);
  const baseDownPayment = currentP * FACTOR_ENGANCHE;
  const totalDownPayment = baseDownPayment + extraDown;
  
  const currentMonthlyContribution = parseNumber(extraMonthlyContribution);
  const baseMonthly = parseNumber(monthlyPayment);
  const totalMonthlyLoad = baseMonthly + currentMonthlyContribution;
  
  const minIncomeRequired = totalMonthlyLoad / INCOME_RATIO;
  
  const estimatedClosingCosts = currentP * 0.05;
  const appraisalCost = 7500;
  const totalOperatingExpenses = estimatedClosingCosts + appraisalCost;
  const netLiquidCredit = currentP > 0 ? currentP - totalOperatingExpenses : 0;
  const suggestedLivingBudget = minIncomeRequired > 0 ? minIncomeRequired - totalMonthlyLoad : 0;

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
• Enganche total (${((totalDownPayment/currentP)*100).toFixed(1)}%): ${formatCurrency(totalDownPayment)}
• Mensualidad base: ${formatCurrency(baseMonthly)}
${currentMonthlyContribution > 0 ? `• Aportación extra: ${formatCurrency(currentMonthlyContribution)}\n` : ''}• Ingreso mínimo: ${formatCurrency(minIncomeRequired)}
* Proyección técnica informativa.`;

    navigator.clipboard.writeText(summaryText).then(() => {
      toast({
        title: "Resumen copiado",
        description: "Datos listos para enviar al interesado.",
      });
    });
  };

  return (
    <>
      <Card className="shadow-xl bg-card border-border overflow-hidden">
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
                  <TooltipContent className="max-w-[250px] p-4 text-xs backdrop-blur-md bg-card/80 border-border/30 shadow-lg">
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

          <div className="space-y-3 p-4 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Enganche base (3%)</span>
              <span className="text-[10px] font-bold text-primary">{formatCurrency(baseDownPayment)}</span>
            </div>
            <Progress value={3} className="h-2 bg-secondary" />
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
            <div className="flex items-center gap-2 p-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-tighter">
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
          className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none shadow-none p-0 flex flex-col overflow-hidden z-[60]"
        >
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                <Calculator className="text-primary w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Simulador Profesional de Crédito</DialogTitle>
                <DialogDescription className="text-xs">Ajuste de escenarios, gastos operativos y perfilamiento de ingresos.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section className="bg-muted/30 p-6 rounded-2xl border border-border/50 shadow-inner">
              <CalculatorInputs 
                isModal={true}
                totalPrice={totalPrice}
                monthlyPayment={monthlyPayment}
                onPriceChange={handleTotalPriceChange}
                onMonthlyChange={handleMonthlyPaymentChange}
                formatWithCommas={formatWithCommas}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-3 border-border shadow-md overflow-hidden bg-card/50">
                <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Ajustes de Escenario (Opcionales)</h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold italic opacity-60">Personaliza la oferta técnica</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Enganche Extra</Label>
                    <div className="relative">
                       <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
                       <Input 
                        placeholder="Ej. 50,000" 
                        className="pl-7 bg-background h-10 text-sm"
                        value={formatWithCommas(extraDownPayment)}
                        onChange={(e) => setExtraDownPayment(e.target.value.replace(/,/g, ''))}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground">Reduce el financiamiento inicial.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Aportación Mensual Extra</Label>
                    <div className="relative">
                       <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
                       <Input 
                        placeholder="Ej. 2,000" 
                        className="pl-7 bg-background h-10 text-sm"
                        value={formatWithCommas(extraMonthlyContribution)}
                        onChange={(e) => setExtraMonthlyContribution(e.target.value.replace(/,/g, ''))}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground">Aumenta el pago a capital sugerido.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Plazo (Meses)</Label>
                    <Input 
                      type="number" 
                      placeholder="192" 
                      className="bg-background h-10 text-sm"
                      value={customTerm}
                      onChange={(e) => setCustomTerm(e.target.value)}
                    />
                    <p className="text-[9px] text-muted-foreground">Predeterminado: 192 meses.</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                 <div className="p-6 rounded-2xl border-2 border-secondary bg-secondary/20 space-y-4 shadow-lg h-full flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-secondary-foreground" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">Perfilamiento</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-primary uppercase font-bold mb-1">Ingreso mín. comprobable</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(minIncomeRequired)}</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-secondary/40 shadow-inner">
                      <span className="text-[10px] font-bold uppercase tracking-tight text-secondary-foreground block mb-1">Presupuesto vida sug.</span>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(suggestedLivingBudget)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="w-5 h-5" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Estructura del Financiamiento</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Monto Crédito</span>
                      <p className="font-bold">{formatCurrency(currentP)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Enganche Total</span>
                      <p className="font-bold text-primary">{formatCurrency(totalDownPayment)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Mensualidad Base</span>
                      <p className="font-bold">{formatCurrency(baseMonthly)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Carga Mensual</span>
                      <p className="font-bold text-primary">{formatCurrency(totalMonthlyLoad)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-accent/20 bg-accent/5 space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Receipt className="w-5 h-5" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Gastos Operativos</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Escrituración (est.)</span>
                      <p className="font-bold">{formatCurrency(estimatedClosingCosts)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Avalúo Pericial</span>
                      <p className="font-bold">{formatCurrency(appraisalCost)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Inversión Inicial</span>
                      <p className="font-bold text-accent">{formatCurrency(totalDownPayment + totalOperatingExpenses)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Saldo Líquido</span>
                      <p className="font-bold text-accent">{formatCurrency(netLiquidCredit)}</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <div className="p-6 border-t border-border/20 bg-background/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 p-2 px-4 rounded-xl bg-muted border border-border/50">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Plan Amortización Variable</span>
                </div>
                <div className="text-[9px] text-muted-foreground/60 leading-tight hidden xl:block">
                  * Cálculos dinámicos basados en entradas de usuario. <br />
                  La viabilidad depende del buró de crédito y antigüedad laboral.
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button 
                  onClick={handleCopySummary}
                  variant="outline"
                  className="flex-1 md:flex-none h-12 px-6 border-green-500 text-green-500 hover:bg-green-500/5 font-bold text-base rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar Resumen
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={clear}
                  className="h-12 px-4 text-muted-foreground hover:text-destructive rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Limpiar Todo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
