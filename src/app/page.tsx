
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Wallet, 
  CalendarDays, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  RotateCcw,
  Palette,
  Moon,
  Sun,
  Cpu,
  Phone,
  BookOpen,
  Info,
  Star,
  ClipboardList,
  Target,
  Calculator,
  Maximize2,
  Receipt,
  Sparkles,
  History,
  UserCheck,
  FileText,
  ArrowRightLeft,
  Calendar,
  Copy,
  Percent
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useAppointments } from '@/hooks/use-appointments';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Theme = 'predeterminado' | 'discreto' | 'corporativo' | 'moderno';

const APP_TIPS = [
  { icon: Calculator, title: "Perfilamiento Rápido", color: "text-primary", text: "Usa la calculadora en llamadas iniciales para filtrar prospectos interesados." },
  { icon: ShieldCheck, title: "Privacidad Total", color: "text-accent", text: "Tus datos son privados y residen en este navegador. No borres el historial." },
  { icon: Phone, title: "Confirmación de Citas", color: "text-yellow-500", text: "Llama 1 hora antes para confirmar y evitar desplazamientos innecesarios." },
  { icon: Maximize2, title: "Modo Presentación", color: "text-primary", text: "Usa el modo pantalla completa para mostrar proyecciones profesionales al cliente." },
  { icon: Receipt, title: "Registro de Cierres", color: "text-green-500", text: "Anota siempre la comisión y monto final para tus estadísticas mensuales." },
  { icon: Sparkles, title: "Seguimiento IA", color: "text-accent", text: "Copia los mensajes de seguimiento tras cada cita para ganar agilidad en WhatsApp." },
  { icon: History, title: "Trazabilidad Técnica", color: "text-muted-foreground", text: "No borres citas pasadas; sirven para auditar tu progreso y tasa de conversión." },
  { icon: UserCheck, title: "Ingreso Mínimo", color: "text-primary", text: "Explica al cliente el ratio del 35% (DTI) para generar confianza financiera." },
  { icon: FileText, title: "Gastos Notariales", color: "text-accent", text: "Menciona el 5% estimado de escrituración al inicio para evitar sorpresas al cierre." },
  { icon: ArrowRightLeft, title: "Tanteo de Montos", color: "text-yellow-500", text: "Ajusta la mensualidad en tiempo real para encontrar el crédito ideal del cliente." },
  { icon: Calendar, title: "Agenda Priorizada", color: "text-primary", text: "Revisa tus citas 'Hoy' cada mañana para planear tu ruta de ventas inmobiliarias." },
  { icon: Copy, title: "Copiado Veloz", color: "text-green-500", text: "Usa el botón 'Copiar' en el simulador para enviar fichas técnicas por móvil." },
  { icon: RotateCcw, title: "Mantenimiento Local", color: "text-destructive", text: "Usa el botón de reiniciar solo si deseas limpiar tu base de datos de trabajo." },
  { icon: Palette, title: "Estética Profesional", color: "text-accent", text: "Cambia al tema 'Corporativo' en sesiones presenciales para una imagen sobria." },
  { icon: ClipboardList, title: "Acuerdos de Firma", color: "text-primary", text: "Escribe acuerdos específicos en 'Notas' para no olvidar compromisos técnicos." },
  { icon: TrendingUp, title: "Métricas de Éxito", color: "text-green-500", text: "Compara tus cierres con el mes pasado para medir tu crecimiento como ejecutivo." },
  { icon: CheckCircle2, title: "Actualización Real", color: "text-accent", text: "Marca el estatus de la cita apenas termine la reunión para no perder datos." },
  { icon: Percent, title: "Factor Mensualidad", color: "text-yellow-500", text: "Recuerda que el 0.6982% es una constante competitiva de nuestro plan." },
  { icon: Info, title: "Avalúo Pericial", color: "text-primary", text: "Explica que el avalúo protege la inversión legal del cliente y de la financiera." },
  { icon: Target, title: "Optimización Logística", color: "text-green-500", text: "Menos citas canceladas equivalen a más tiempo efectivo para prospección." }
];

export default function Home() {
  const appointmentState = useAppointments();
  const { stats, isLoaded, resetData } = appointmentState;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState<Theme>('predeterminado');
  const [api, setApi] = useState<CarouselApi>();
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('finanto-theme') as Theme;
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }, []);

  // Auto-rotate effect for Carousel
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [api]);

  const applyTheme = (themeId: Theme) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    
    if (themeId === 'corporativo') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleThemeChange = (themeId: Theme) => {
    applyTheme(themeId);
    localStorage.setItem('finanto-theme', themeId);
    
    const themeNames = {
      predeterminado: 'Predeterminado',
      discreto: 'Discreto',
      corporativo: 'Corporativo',
      moderno: 'Moderno'
    };

    toast({
      title: "Tema actualizado",
      description: `Se ha aplicado el tema ${themeNames[themeId]}.`,
    });
  };

  const copyFooterPhone = () => {
    navigator.clipboard.writeText("6646947418").then(() => {
      toast({
        title: "Copiado",
        description: "El número telefónico ha sido copiado al portapapeles.",
      });
    });
  };

  if (!isLoaded) return null;

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    toast({
      title: "Sistema de Financiamiento inmobiliario reiniciado",
      description: "Todos los datos locales han sido borrados y restaurados con datos de prueba.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[20px] bg-card/10 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-xl font-headline font-bold tracking-tight text-foreground">
              Finanto <span className="text-primary">BETA</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer border-b-2 border-primary pb-1">
              <LayoutDashboard className="w-4 h-4" />v0.7.1 (23 de marzo)
            </div>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-foreground">Ejecutivo Olivares Mtz</span>
              <span className="text-[10px] text-primary uppercase tracking-tighter font-medium">Financiamiento Inmobiliario</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden backdrop-blur-md">
                  {theme === 'moderno' ? <Cpu className="w-5 h-5 text-primary" /> : theme === 'corporativo' ? <Sun className="w-5 h-5 text-primary" /> : theme === 'discreto' ? <Moon className="w-5 h-5 text-primary" /> : <Palette className="w-5 h-5 text-primary" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 backdrop-blur-2xl bg-popover border-border/30">
                <DropdownMenuLabel className="text-foreground/80 dark:text-foreground">Temas de Ejecutivos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleThemeChange('predeterminado')} className="flex items-center gap-2 cursor-pointer text-foreground/80 dark:text-foreground">
                  <div className="w-3 h-3 rounded-full bg-[#7ec1ff]" /> Predeterminado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('discreto')} className="flex items-center gap-2 cursor-pointer text-foreground/80 dark:text-foreground">
                  <div className="w-3 h-3 rounded-full bg-[#5865f2]" /> Discreto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('corporativo')} className="flex items-center gap-2 cursor-pointer text-foreground/80 dark:text-foreground">
                  <div className="w-3 h-3 rounded-full bg-slate-400 border border-gray-300" /> Corporativo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('moderno')} className="flex items-center gap-2 cursor-pointer text-foreground/80 dark:text-foreground">
                  <div className="w-3 h-3 rounded-full bg-[#00f7ff] shadow-[0_0_8px_#00f7ff]" /> Moderno
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 flex flex-col">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink-0">
          {[
            { 
              label: 'Citas hoy', 
              value: stats.todayCount.toString(), 
              icon: CalendarDays, 
              color: 'text-primary'
            },
            { 
              label: 'Citas pendientes', 
              value: stats.pendingCount.toString(), 
              icon: Wallet, 
              color: 'text-primary'
            },
            { 
              label: 'Prospectos (mes)', 
              value: stats.currentMonthProspects.toString(), 
              icon: Users, 
              color: 'text-accent',
              subValue: stats.lastMonthProspects,
              subLabel: 'Mes pasado'
            },
            { 
              label: 'Cierres', 
              value: stats.currentMonthSales.toString(), 
              icon: CheckCircle2, 
              color: 'text-green-500',
              subValue: stats.lastMonthSales,
              subLabel: 'Mes pasado'
            },
          ].map((stat, i) => (
            <Card key={i} className={cn(
              "bg-card/30 backdrop-blur-xl hover:border-primary/30 transition-all group",
              (theme === 'predeterminado' || theme === 'discreto') ? "border-transparent" : "border-border/50"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-full bg-muted/50 ${stat.color} backdrop-blur-md`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold truncate">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-headline font-bold text-foreground">{stat.value}</p>
                    {stat.subValue !== undefined && (
                      <div className="flex items-center text-[10px] font-medium text-muted-foreground">
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5 opacity-50" />
                        <span>{stat.subValue} <span className="opacity-50">({stat.subLabel})</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start flex-1">
          <section className="xl:col-span-5">
            <div className="sticky top-24 space-y-6">
              <CreditCalculator />
              
              <div className="relative p-6 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md overflow-hidden group">
                <Carousel 
                  setApi={setApi}
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                >
                  <CarouselContent>
                    {APP_TIPS.map((tip, index) => (
                      <CarouselItem key={index}>
                        <div className="space-y-2">
                          <h3 className={cn("text-sm font-headline font-bold flex items-center gap-2", tip.color)}>
                            <tip.icon className="w-4 h-4" /> {tip.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed min-h-[3rem]">
                            {tip.text}
                          </p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <CarouselPrevious className="static translate-y-0 h-8 w-8 bg-transparent border-primary/20 hover:bg-primary/10" />
                    <CarouselNext className="static translate-y-0 h-8 w-8 bg-transparent border-primary/20 hover:bg-primary/10" />
                  </div>
                </Carousel>
                <div className="absolute top-2 right-4 text-[9px] font-bold text-primary/30 uppercase tracking-tighter">
                  Tip de Productividad
                </div>
              </div>
            </div>
          </section>

          <section className="xl:col-span-7 space-y-8 pb-10">
            <AppointmentsDashboard 
              appointments={appointmentState.appointments}
              upcoming={appointmentState.upcoming}
              past={appointmentState.past}
              addAppointment={appointmentState.addAppointment}
              updateStatus={appointmentState.updateStatus}
              editAppointment={appointmentState.editAppointment}
              toggleConfirmation={appointmentState.toggleConfirmation}
              formatFriendlyDate={appointmentState.formatFriendlyDate}
              format12hTime={appointmentState.format12hTime}
            />
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-border/40 py-8 bg-card/10 backdrop-blur-[20px] shrink-0">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
          <p>© 2026 Finanto - Ejecutivo en Financiamiento Inmobiliario</p>
          <div className="flex items-center gap-6">
            <button 
              onClick={copyFooterPhone}
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group"
            >
              <Phone className="w-3.5 h-3.5 group-hover:animate-pulse" />
              <span>664 694 7418</span>
            </button>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] font-bold uppercase text-muted-foreground hover:text-primary hover:bg-primary/10 backdrop-blur-md"
                onClick={() => setShowHelp(true)}
              >
                <BookOpen className="w-3 h-3 mr-1" /> Guía del sistema
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] font-bold uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/10 backdrop-blur-md"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reiniciar sistema
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="backdrop-blur-[20px] bg-card/20 border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar reinicio total?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borrará todas tus citas, notas y configuraciones guardadas en este navegador. Se restaurarán los datos de prueba iniciales de la financiera inmobiliaria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="backdrop-blur-md">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="bg-destructive text-white hover:bg-destructive/90 shadow-lg"
            >
              Sí, reiniciar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] bg-card border-border backdrop-blur-3xl flex flex-col p-0 shadow-2xl overflow-hidden">
          <DialogHeader className="p-8 border-b border-border/50 bg-primary/5 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-headline font-bold text-foreground">Guía Técnica de Finanto</DialogTitle>
                <DialogDescription className="text-base">Manual de operación para ejecutivos en financiamiento inmobiliario (v0.7.1)</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-8 space-y-10 text-foreground/90 pb-12">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
                  Introducción al Sistema
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Finanto es una plataforma técnica diseñada para optimizar la eficiencia operativa del ejecutivo. Facilita el perfilamiento rápido de prospectos y garantiza una administración técnica de los créditos inmobiliarios.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-muted/30 border-border/50 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-accent">
                      <Wallet className="w-5 h-5" /> 1. Calculadora de Precisión
                    </h3>
                    <ul className="text-sm space-y-3 list-disc pl-5 text-muted-foreground">
                      <li><strong>Perfilamiento profesional:</strong> Determine montos aproximados de forma inmediata para interesados vía telefónica.</li>
                      <li><strong>Presentación Profesional:</strong> Realice ajustes de montos frente al cliente en tiempo real durante la 1ra consulta sin depender de conexión.</li>
                      <li><strong>Independencia Técnica:</strong> Herramienta optimizada para operar y "tantear" montos sin depender de servidores externos.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-accent">
                      <CalendarDays className="w-5 h-5" /> 2. Gestión de Agenda
                    </h3>
                    <ul className="text-sm space-y-3 list-disc pl-5 text-muted-foreground">
                      <li><strong>Priorización Diaria:</strong> El sistema organiza las citas del día para maximizar la productividad operativa del ejecutivo.</li>
                      <li><strong>Optimización Logística:</strong> Valide la confirmación de asistencia para evitar tiempos muertos y desplazamientos innecesarios.</li>
                      <li><strong>Trazabilidad de Prospectos:</strong> Centraliza cada acuerdo y resultado de cita para un seguimiento robusto del crédito.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-4 bg-primary/5 p-6 rounded-2xl border border-primary/20">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                  <ClipboardList className="w-6 h-6" /> 3. Administración de Cierres y Datos
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Al concretar un trámite, el panel de <strong>Registro de Datos Críticos</strong> permite asegurar la integridad del expediente. Es fundamental capturar el monto final del crédito, las comisiones y la fecha de firma para mantener un control administrativo impecable.
                </p>
              </section>

              <section className="space-y-4 bg-accent/5 p-6 rounded-2xl border border-accent/20">
                <h3 className="text-xl font-bold flex items-center gap-2 text-accent">
                  <Target className="w-6 h-6" /> 4. Productividad y Control
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  El sistema monitorea automáticamente su desempeño mensual. Compare sus cierres y prospectos con periodos anteriores para identificar áreas de oportunidad y mantener un flujo constante de expedientes de financiamiento inmobiliario.
                </p>
              </section>

              <Separator className="bg-border/50" />

              <section className="p-6 rounded-2xl bg-muted/20 border border-border/50 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                  <Info className="w-5 h-5" /> Privacidad y Almacenamiento
                </h3>
                <ul className="text-sm space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Seguridad Local:</strong> Los datos residen exclusivamente en su navegador. Esto garantiza que la información sensible de clientes sea totalmente privada.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Respaldo Técnico:</strong> No borre el historial si desea conservar sus registros. El sistema opera de forma local para mayor rapidez y privacidad.</span>
                  </li>
                </ul>
              </section>

              <p className="text-center text-xs text-muted-foreground italic pt-6 border-t border-border/20">
                Finanto: Diseñado para el ejecutivo en financiamiento inmobiliario que prioriza el control técnico y el cierre efectivo del patrimonio familiar.
              </p>
            </div>
          </div>
          
          <DialogFooter className="p-6 border-t border-border/50 bg-muted/20 shrink-0">
            <Button onClick={() => setShowHelp(false)} className="w-full sm:w-auto font-bold h-12 px-8 text-lg">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
