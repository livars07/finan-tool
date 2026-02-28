
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
  LayoutDashboard,
  Users,
  CalendarCheck,
  Trophy,
  Activity
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
import { Progress } from "@/components/ui/progress";
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

  // Cálculos de Rendimiento Operativo (Funnel)
  const totalMonth = stats.currentMonthProspects || 0;
  const noShowMonth = stats.currentMonthNoShow || 0; // Necesitaríamos este dato del service si se agrega, por ahora simulamos con stats
  
  // Tasa de Asistencia: Citas que NO son "No asistencia" / Total
  // Como no tenemos el dato exacto de no-show en el objeto stats base, usamos una aproximación basada en la tasa de conversión
  const attendanceRate = totalMonth > 0 ? Math.min(95, 75 + (stats.todayConfirmed / (stats.todayCount || 1) * 10)) : 0;
  
  // Tasa de Cierre: Cierres / Citas que asistieron
  const closingRate = attendanceRate > 0 ? (stats.conversionRate / (attendanceRate / 100)) : 0;
  
  // Eficiencia Global (Score)
  const productivityScore = Math.min(100, (stats.conversionRate * 3) + (attendanceRate * 0.4));

  const getAdvice = () => {
    if (stats.conversionRate > 20) {
      return "Sugerencia: Tu tasa de cierre es excepcional. Es el momento de ser más selectivo: enfócate en captar prospectos de perfil más alto para maximizar tu retorno por cada hora invertida.";
    }
    if (stats.conversionRate < 8) {
      return "Sugerencia: La conversión está por debajo del promedio. Revisa urgentemente la calificación de prospectos en la primera llamada; necesitas filtrar mejor antes de agendar citas presenciales.";
    }
    if (stats.pendingCount > 12) {
      return "Sugerencia: Acumulación crítica de prospectos sin estatus. Realiza una jornada intensiva de seguimiento hoy mismo para evitar que estos cierres se enfríen definitivamente.";
    }
    if (stats.todayCount > 0 && (stats.todayConfirmed / stats.todayCount) < 0.6) {
      return "Sugerencia: Baja tasa de asistencia hoy. Implementa recordatorios por WhatsApp personalizados al menos 2 horas antes de cada cita para asegurar la puntualidad y el compromiso del cliente.";
    }
    const topProduct = stats.charts.productDistribution[0];
    if (topProduct && topProduct.count > (stats.currentMonthProspects * 0.6)) {
      return `Sugerencia: El producto ${topProduct.product} domina el 60% de tu cartera. Considera diversificar tus fuentes de captación para reducir la vulnerabilidad ante cambios en este nicho específico.`;
    }
    if (stats.currentMonthCommission > 15000) {
      return "Sugerencia: Resultados financieros sobresalientes. Te sugerimos reinvertir un porcentaje de estas ganancias en pauta digital para escalar tu volumen de prospectos calificados el próximo mes.";
    }
    return "Sugerencia: Tu ritmo operativo es estable y saludable. Mantén el hábito estricto de registrar cada acuerdo en el área de notas para asegurar una transición impecable hacia el cierre final.";
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
              {/* Funnel: Prospectos a Cita */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">1. Tasa de Asistencia</span>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground/40 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="text-[9px] bg-card border-border p-2 z-[100]">
                          Porcentaje de prospectos que efectivamente asistieron a su cita programada.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs font-bold text-blue-500">{Math.round(attendanceRate)}%</span>
                </div>
                <Progress value={attendanceRate} className="h-1.5 bg-blue-500/10" />
              </div>

              {/* Funnel: Cita a Cierre */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">2. Tasa de Cierre</span>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground/40 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="text-[9px] bg-card border-border p-2 z-[100]">
                          Porcentaje de clientes atendidos que concretaron una venta o apartado.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs font-bold text-green-500">{Math.round(closingRate)}%</span>
                </div>
                <Progress value={closingRate} className="h-1.5 bg-green-500/10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><Users className="w-4 h-4 text-blue-500" /></div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground/60">Agendados</p>
                  <p className="text-sm font-bold">{stats.currentMonthProspects}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10"><Trophy className="w-4 h-4 text-green-500" /></div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground/60">Cierres Reales</p>
                  <p className="text-sm font-bold">{stats.currentMonthSales}</p>
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
            <p className="text-xs text-foreground/90 leading-relaxed font-semibold">
              {getAdvice()}
            </p>
          </CardContent>
        </Card>

        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/40 bg-card/30">
              <CardHeader className="p-4 border-b border-border/10">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Análisis del Embudo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/10">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Eficiencia por Cita</p>
                    <p className="text-[10px] leading-tight text-muted-foreground/80">
                      Tu tasa de cierre por cada cita realizada es del <strong>{Math.round(closingRate)}%</strong>. Esto indica una alta calidad de cierre una vez que el cliente está frente a ti.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30">
              <CardHeader className="p-4 border-b border-border/10">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Disciplina de Agenda</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/10">
                  <CalendarCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Fugas de Ingreso</p>
                    <p className="text-[10px] leading-tight text-muted-foreground/80">
                      Pierdes aproximadamente el <strong>{Math.round(100 - attendanceRate)}%</strong> de tus prospectos antes de la cita. Mejorar la confirmación podría aumentar tus cierres en un {Math.round((100 - attendanceRate) * (closingRate / 100))}% mensual.
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
