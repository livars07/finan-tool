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

  const productivityScore = Math.min(100, (stats.conversionRate * 3) + (stats.todayConfirmed / (stats.todayCount || 1) * 20));

  const getAdvice = () => {
    if (stats.conversionRate > 20) return "¡Felicidades! Tu tasa de cierre es élite. Intenta aumentar el volumen de prospectos para escalar.";
    if (stats.conversionRate < 5) return "Tu conversión es baja. Revisa tu script de 1ra consulta para calificar mejor a los interesados.";
    if (stats.pendingCount > 10) return "Tienes muchos prospectos sin estatus. Haz seguimiento hoy para evitar que se enfríen.";
    return "Mantén el ritmo actual. La constancia en el registro de notas te ayudará a cerrar más este mes.";
  };

  const StatsContent = ({ expanded = false }) => (
    <div className={cn("space-y-6", expanded && "grid grid-cols-1 xl:grid-cols-2 gap-8 items-start space-y-0")}>
      <div className="space-y-6">
        <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-sm">
          <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-xs font-bold uppercase tracking-widest">Flujo Semanal</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] max-w-[200px]">Muestra el volumen de citas vs cierres logrados en los últimos 7 días.</TooltipContent>
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
                  className="text-[10px] font-bold uppercase text-muted-foreground" 
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
              <CardTitle className="text-xs font-bold uppercase tracking-widest">Mix de Productos</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] max-w-[200px]">Distribución de tus prospectos según el tipo de producto este mes.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="p-4 h-[200px] flex items-center justify-center">
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
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 ml-4">
              {stats.charts.productDistribution.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[9px] font-bold uppercase text-muted-foreground truncate max-w-[80px]">{entry.product}: {entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-tighter">Score de Productividad</h3>
              </div>
              <span className="text-2xl font-black text-primary">{Math.round(productivityScore)}%</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                <span>Rendimiento Actual</span>
                <span>Meta: 100%</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                  style={{ width: `${productivityScore}%` }} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-card/40 rounded-xl border border-border/20">
                <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Tasa Cierre</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{stats.conversionRate}%</span>
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                </div>
              </div>
              <div className="p-3 bg-card/40 rounded-xl border border-border/20">
                <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Eficiencia Citas</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{Math.round((stats.todayConfirmed / (stats.todayCount || 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Consejo de Éxito</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
              "{getAdvice()}"
            </p>
            <Button variant="link" className="h-auto p-0 text-[10px] font-bold uppercase mt-4 text-accent">
              Ver estrategia completa <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {expanded && (
          <Card className="border-border/40 bg-card/30">
            <CardHeader className="p-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">Propuesta de Crecimiento</CardTitle>
              <CardDescription className="text-[10px]">Basado en tus tendencias de los últimos 30 días.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] leading-tight">Tu producto más rentable este mes es <strong>{stats.charts.productDistribution[0]?.product || 'Casa'}</strong>. Considera especializar tu publicidad en este nicho.</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <TrendingUp className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] leading-tight">Si mantienes tu tasa de {stats.conversionRate}%, necesitas <strong>{Math.ceil(20 / (stats.conversionRate / 100))}</strong> prospectos más para llegar a tu meta de 20 ventas mensuales.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Card className="shadow-lg bg-card border-border overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-primary w-5 h-5" />
            <CardTitle className="text-lg font-headline font-semibold">Stats Avanzados</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all"
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
          className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none shadow-none p-0 flex flex-col overflow-hidden z-[60]"
        >
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                <BarChart3 className="text-primary w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Inteligencia de Negocio</DialogTitle>
                <DialogDescription className="text-xs">Análisis profundo de conversión, tendencias y productividad.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <StatsContent expanded={true} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
