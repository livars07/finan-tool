"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Lightbulb, 
  Maximize2, 
  X,
  Info,
  Activity,
  CalendarDays,
  Trophy,
  Users,
  History
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AdvancedStatsProps {
  stats: any;
  initialExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const chartConfig = {
  prospects: {
    label: "Citas",
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

  const totalMonth = stats.currentMonthProspects || 0;
  const attendanceRate = totalMonth > 0 ? Math.min(95, 75 + (stats.todayConfirmed / (stats.todayCount || 1) * 10)) : 0;
  const closingRate = attendanceRate > 0 ? (stats.conversionRate / (attendanceRate / 100)) : 0;
  const productivityScore = Math.min(100, (stats.conversionRate * 3) + (attendanceRate * 0.4));

  const getAdvice = () => {
    if (stats.conversionRate > 20) return "Sugerencia: Tu tasa de cierre es excepcional. Es el momento de ser más selectivo: enfócate en captar perfiles de crédito más alto para maximizar tu retorno.";
    if (stats.conversionRate < 8) return "Sugerencia: La conversión está por debajo del promedio. Revisa la calificación de prospectos en la primera llamada; necesitas filtrar mejor antes de agendar.";
    if (stats.pendingCount > 12) return "Sugerencia: Acumulación crítica de prospectos sin estatus. Realiza una jornada de seguimiento intensivo hoy para evitar que estos cierres se enfríen.";
    if (stats.todayCount > 0 && (stats.todayConfirmed / stats.todayCount) < 0.6) return "Sugerencia: Baja tasa de asistencia hoy. Implementa recordatorios por WhatsApp 2 horas antes de cada cita para asegurar el compromiso.";
    if (stats.currentMonthCommission > 15000) return "Sugerencia: Resultados financieros sobresalientes. Te sugerimos reinvertir un porcentaje en pauta digital para escalar tu volumen el próximo mes.";
    return "Sugerencia: Tu ritmo operativo es estable. Mantén el hábito estricto de registrar cada acuerdo en notas para asegurar una transición impecable hacia el cierre.";
  };

  const WeeklyChart = ({ data, title, icon: Icon }: { data: any, title: string, icon: any }) => (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{title}</CardTitle>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="w-3.5 h-3.5 text-muted-foreground/60" /></Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px] max-w-[200px] bg-card border-border shadow-xl p-3 z-[100]" side="top">
              <p className="font-bold mb-1 uppercase text-primary">Flujo de Citas</p>
              Muestra el volumen de citas agendadas frente a cierres efectivos en el periodo seleccionado.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-4 h-[180px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false} 
              className="text-[10px] font-bold uppercase text-muted-foreground/60" 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="prospects" name="Citas" fill="var(--color-prospects)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sales" name="Ventas" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  const PerformanceSection = () => (
    <Card className="border-primary/20 bg-primary/5 shadow-lg relative overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Rendimiento Operativo</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-primary leading-none">{Math.round(productivityScore)}%</span>
            <span className="text-[7px] font-bold uppercase text-primary/40">Eficiencia Global</span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">1. Tasa de Asistencia</span>
              <span className="text-xs font-bold text-blue-500">{Math.round(attendanceRate)}%</span>
            </div>
            <Progress value={attendanceRate} className="h-1.5 bg-blue-500/10" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">2. Tasa de Cierre</span>
              <span className="text-xs font-bold text-green-500">{Math.round(closingRate)}%</span>
            </div>
            <Progress value={closingRate} className="h-1.5 bg-green-500/10" />
          </div>
        </div>
      </CardContent>
    </Card>
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
            className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10"
            onClick={() => setIsExpanded(true)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <WeeklyChart data={stats.charts.dailyActivity} title="Flujo Semanal Actual" icon={CalendarDays} />
          <PerformanceSection />
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
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Inteligencia de Negocio</DialogTitle>
                <DialogDescription className="text-xs">Análisis comparativo de flujo semanal y eficiencia de conversión.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-muted/5">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                <WeeklyChart data={stats.charts.dailyActivity} title="Flujo Semanal Actual" icon={CalendarDays} />
                <WeeklyChart data={stats.charts.lastWeekActivity} title="Flujo Semana Anterior" icon={History} />
              </div>
              <div className="space-y-6">
                <PerformanceSection />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10"><Users className="w-5 h-5 text-blue-500" /></div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Total Citas Mes</p>
                      <p className="text-xl font-bold">{stats.currentMonthProspects}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10"><Trophy className="w-5 h-5 text-green-500" /></div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Ventas Mes</p>
                      <p className="text-xl font-bold">{stats.currentMonthSales}</p>
                    </div>
                  </div>
                </div>

                <Card className="border-accent/20 bg-accent/5 relative overflow-hidden">
                  <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-accent" />
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-accent/80">Sugerencia Estratégica</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-foreground/90 leading-relaxed font-semibold">{getAdvice()}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
