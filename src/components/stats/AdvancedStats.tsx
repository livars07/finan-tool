
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Target, 
  Lightbulb, 
  Maximize2, 
  X,
  Info,
  ArrowUpRight,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  LabelList
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AdvancedStatsProps {
  stats: any;
  initialExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const chartConfig = {
  prospects: {
    label: "Prospectos",
    color: "hsl(var(--primary))",
  },
  sales: {
    label: "Ventas",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export default function AdvancedStats({ stats, initialExpanded = false, onExpandedChange }: AdvancedStatsProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    onExpandedChange?.(isExpanded);
    if (isExpanded) {
      window.history.pushState(null, '', '/stats');
    } else if (window.location.pathname === '/stats') {
      window.history.pushState(null, '', '/');
    }
  }, [isExpanded, onExpandedChange]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  // Cálculo de productividad basado en conversión y confirmación de hoy
  const productivityScore = Math.min(100, (stats.conversionRate * 3) + (stats.todayConfirmed / (stats.todayCount || 1) * 20));

  const getAdvice = () => {
    if (stats.conversionRate > 20) return "Tu tasa de cierre es élite. Mantén este ritmo y enfócate en prospectos de alto valor.";
    if (stats.conversionRate < 5) return "Tu conversión es baja. Revisa tu script de 1ra consulta para calificar mejor a los interesados.";
    if (stats.pendingCount > 10) return "Tienes muchos prospectos sin estatus definido. Haz seguimiento hoy para que no se enfríen.";
    return "Tu rendimiento es estable. La constancia en el registro de notas será tu mejor aliado para el cierre de mes.";
  };

  const StatsContent = ({ expanded = false }) => (
    <div className={cn("space-y-6", expanded && "grid grid-cols-1 xl:grid-cols-2 gap-8 items-start space-y-0")}>
      <div className="space-y-6">
        <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-sm overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Flujo Semanal de Citas</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="w-3.5 h-3.5 text-muted-foreground/60" /></Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] max-w-[200px] bg-card border-border shadow-xl p-3 z-[100]" side="top">
                  <p className="font-bold mb-1 uppercase text-primary">¿Cómo se calcula?</p>
                  Muestra el volumen total de citas registradas frente a los cierres (Cierre/Apartado) logrados en los últimos 7 días calendario.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="p-4 h-[200px] sm:h-[250px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={stats.charts.dailyActivity}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  tickMargin={10} 
                  axisLine={false} 
                  className="text-[10px] font-bold uppercase text-muted-foreground/60" 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="prospects" fill="var(--color-prospects)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-sm">
          <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Mezcla de Productos (Mes)</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="w-3.5 h-3.5 text-muted-foreground/60" /></Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] max-w-[200px] bg-card border-border shadow-xl p-3 z-[100]" side="top">
                  <p className="font-bold mb-1 uppercase text-accent">Distribución de Ventas</p>
                  Muestra qué porcentaje de tus prospectos de este mes pertenecen a cada categoría de producto. Útil para identificar tendencias de mercado.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="p-4 h-[200px] flex items-center justify-center">
            {stats.charts.productDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stats.charts.productDistribution}
                      dataKey="count"
                      nameKey="product"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={5}
                    >
                      {stats.charts.productDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '10px' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1 ml-4 min-w-[100px]">
                  {stats.charts.productDistribution.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[9px] font-bold uppercase text-muted-foreground/60 truncate">{entry.product}: {entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-[10px] text-muted-foreground/40 font-bold uppercase">Sin datos este mes</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5 shadow-lg relative overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Rendimiento Operativo</h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-primary leading-none">{Math.round(productivityScore)}%</span>
                <span className="text-[7px] font-bold uppercase text-primary/40">Score de Eficiencia</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground/60">
                <span>Rendimiento Actual</span>
                <span>Meta Ideal: 100%</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/5">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.6)]" 
                  style={{ width: `${productivityScore}%` }} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-card/40 rounded-xl border border-border/20 group hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground/60">Tasa Cierre</p>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Info className="w-2.5 h-2.5 text-muted-foreground/40 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="text-[9px] bg-card border-border shadow-xl p-2 z-[100]">
                        Porcentaje de ventas (Cierres + Apartados) frente al total de prospectos del mes actual.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{stats.conversionRate}%</span>
                  {stats.conversionRate >= stats.lastMonthConversionRate ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-red-500 rotate-90" />
                  )}
                </div>
              </div>
              <div className="p-3 bg-card/40 rounded-xl border border-border/20 group hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground/60">Efectividad Hoy</p>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Info className="w-2.5 h-2.5 text-muted-foreground/40 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="text-[9px] bg-card border-border shadow-xl p-2 z-[100]">
                        Relación de citas confirmadas frente al total programado para hoy. Mide tu disciplina operativa.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {stats.todayCount > 0 ? Math.round((stats.todayConfirmed / stats.todayCount) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Lightbulb className="w-16 h-16 text-accent" />
          </div>
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2 relative z-10">
            <Lightbulb className="w-4 h-4 text-accent" />
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-accent/80">Sugerencia Estratégica</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 relative z-10">
            <p className="text-xs text-foreground/80 leading-relaxed font-semibold italic">
              "{getAdvice()}"
            </p>
          </CardContent>
        </Card>

        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/40 bg-card/30">
              <CardHeader className="p-4 border-b border-border/10">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Oportunidad de Crecimiento</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/10">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Optimización de Nicho</p>
                    <p className="text-[10px] leading-tight text-muted-foreground/80">
                      Tu producto con mayor volumen es <strong>{stats.charts.productDistribution[0]?.product || 'Casa'}</strong>. Considera especializar tu script de ventas para cerrar más rápido este tipo de inmuebles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30">
              <CardHeader className="p-4 border-b border-border/10">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Proyección de Metas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/10">
                  <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Camino al Cierre</p>
                    <p className="text-[10px] leading-tight text-muted-foreground/80">
                      Con tu tasa actual de <strong>{stats.conversionRate}%</strong>, para alcanzar una meta de 15 cierres necesitas atraer aproximadamente <strong>{Math.ceil(15 / (stats.conversionRate / 100 || 0.1))}</strong> prospectos nuevos este mes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Card className="shadow-lg bg-card border-border overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-primary w-5 h-5" />
            <CardTitle className="text-lg font-headline font-semibold">Stats Avanzados</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
            onClick={() => setIsExpanded(true)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <StatsContent />
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
                <BarChart3 className="text-primary w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Inteligencia de Negocio Inmobiliario</DialogTitle>
                <DialogDescription className="text-xs">Análisis profundo de conversión, tendencias de mercado y productividad operativa.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-muted/5">
            <div className="max-w-[1400px] mx-auto">
              <StatsContent expanded={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

