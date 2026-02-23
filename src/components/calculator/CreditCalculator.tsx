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
  Receipt
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

// Componente de Inputs separado para evitar pérdida de foco por re-renderizado
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
        Precio del Inmueble (P)
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
        <Input
          id={isModal ? "totalPriceModal" : "totalPrice"}
          placeholder="0.00"
          className={isModal ? "pl-7 font-bold text-2xl bg-muted/20 h-14" : "pl-7 font-semibold text-lg bg-muted/20"}
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
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-accent font-bold">$</span>
        <Input
          id={isModal ? "monthlyPaymentModal" : "monthlyPayment"}
          placeholder="0.00"
          className={isModal ? "pl-7 border-accent/30 focus-visible:ring-accent font-bold text-2xl text-accent bg-accent/5 h-14" : "pl-7 border-accent/30 focus-visible:ring-accent font-bold text-lg text-accent bg-accent/5"}
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

  const handleCopySummary = () => {
    if (currentP <= 0) {
      toast({
        title: "Calculadora vacía",
        description: "Ingresa un monto para copiar el resumen.",
        variant: "destructive"
      });
      return;
    }

    const summaryText = `Resumen de Cotización Hipotecaria:
------------------------------
• Valor Inmueble: ${formatCurrency(currentP)}
• Enganche (3%): ${formatCurrency(currentDownPayment)}
• Mensualidad: ${formatCurrency(currentMonthly)}
------------------------------
* Sujeto a aprobación de crédito.`;

    navigator.clipboard.writeText(summaryText).then(() => {
      toast({
        title: "Resumen Copiado",
        description: "Datos listos para enviar al cliente.",
      });
    });
  };

  return (
    <>
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
              className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-muted-foreground">
            Plazo 192 meses - Plan Tradicional 12pp
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

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl p-0 backdrop-blur-[20px] flex flex-col">
          <DialogHeader className="px-8 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/20 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                <Calculator className="text-primary w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Simulador Profesional</DialogTitle>
                <DialogDescription className="text-xs">Cálculos de alta precisión para cierres inmobiliarios.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <section className="bg-muted/30 p-6 rounded-2xl border border-border/50">
              <CalculatorInputs 
                isModal={true}
                totalPrice={totalPrice}
                monthlyPayment={monthlyPayment}
                onPriceChange={handleTotalPriceChange}
                onMonthlyChange={handleMonthlyPaymentChange}
                formatWithCommas={formatWithCommas}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Resumen Financiero</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Financiamiento (97%):</span>
                      <span className="font-bold">{formatCurrency(currentP * 0.97)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Enganche (3%):</span>
                      <span className="font-bold text-primary">{formatCurrency(currentDownPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-border/30">
                      <span className="text-muted-foreground font-semibold">Mensualidad:</span>
                      <span className="text-lg font-bold text-primary">{formatCurrency(currentMonthly)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-accent/20 bg-accent/5 space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Receipt className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Gastos Adicionales</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Escrituras (est. 5%):</span>
                      <span className="font-bold">{formatCurrency(currentP * 0.05)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Avalúo (est.):</span>
                      <span className="font-bold">$7,500.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-border/30">
                      <span className="text-muted-foreground font-semibold">Inversión Inicial:</span>
                      <span className="text-lg font-bold text-accent">{formatCurrency(currentDownPayment + (currentP * 0.05) + 7500)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 space-y-4">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <ShieldAlert className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Validación de Perfil</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Ingreso Mínimo Sugerido</p>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(minIncomeRequired)}</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-[9px] text-muted-foreground mb-1">Capacidad de Pago (DTI 35%)</p>
                      <Progress value={35} className="h-1.5 bg-yellow-500/20" />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Notas Técnicas
                  </h4>
                  <div className="space-y-2 text-[10px] text-muted-foreground leading-tight">
                    <p>• Gastos varían por estado.</p>
                    <p>• Seguros integrados en pago.</p>
                    <p>• Factor 0.6982% (16 años).</p>
                    <p>• Perfil requiere triple de ingresos.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col h-full justify-between">
                <div className="p-6 rounded-2xl border border-green-500/20 bg-green-500/5 flex-1 flex flex-col justify-center items-center text-center space-y-4">
                  <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Listos para prospectar</h4>
                    <p className="text-xs text-muted-foreground mt-1">Comparte el resumen con tu cliente en un solo clic.</p>
                  </div>
                </div>
                
                <div className="space-y-3 shrink-0">
                  <Button 
                    onClick={handleCopySummary}
                    variant="outline"
                    className="w-full h-12 border-green-500 text-green-500 hover:bg-green-500/5 font-bold shadow-sm"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copiar Resumen (Sin fondo)
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={clear}
                    className="w-full h-10 text-muted-foreground hover:text-destructive"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar Valores
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
