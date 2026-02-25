
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, CalendarDays, Users, CheckCircle2, ShieldCheck, TrendingUp, RotateCcw,
  Palette, Moon, Sun, Cpu, Phone, BookOpen, Info, Calculator, Maximize2, Sparkles, History,
  ClipboardList, Target, Calendar, Copy, Crown, Zap, Snowflake, Trash2, Rocket, ShieldAlert,
  Smartphone, MessageSquare, CalendarClock, Coins, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useAppointments } from '@/hooks/use-appointments';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import * as Service from '@/services/appointment-service';

type Theme = 'corporativo' | 'tranquilo' | 'moderno' | 'discreto' | 'olivares' | 'gelido' | 'corporativo-v2';

const APP_TIPS = [
  { icon: Calculator, title: "Calculadora Rápida", color: "text-primary", text: "Usa la calculadora rapida en caso de tener una llamada con un interesado que pregunte montos aproximados." },
  { icon: ClipboardList, title: "Gestión Eficiente", color: "text-accent", text: "Nunca olvides registrar todas tus citas en el gestionador de citas, para tener un orden eficiente de fechas y datos en un solo lugar." },
  { icon: ShieldCheck, title: "Seguridad de Datos", color: "text-destructive", text: "Recuerda, tus citas son guardadas dentro de este navegador, si cambias de navegador o de dispositivo contacta al desarrollador." },
  { icon: Sparkles, title: "Próximas Mejoras", color: "text-yellow-500", text: "IA para automatización de mensajes personalizados, sincronización en la nube y más gráficas de rendimiento." },
  { icon: Maximize2, title: "Modo Presentación", color: "text-primary", text: "Usa el icono de expansión para mostrar los números al cliente de forma limpia y profesional." },
  { icon: Palette, title: "Imagen Corporativa", color: "text-accent", text: "Usa el tema <<corporativo>> para mostrar pantalla a tus clientes presenciales." },
  { icon: Copy, title: "Envío a WhatsApp", color: "text-green-500", text: "Copia los datos de cada cliente para mandarlos por el grupo de WhatsApp rápidamente." }
];

export interface FinantoMainProps {
  initialSection?: 'guia' | 'simulador' | 'gestor';
}

export default function FinantoMain({ initialSection }: FinantoMainProps) {
  const appointmentState = useAppointments();
  const { stats, isLoaded, resetData, clearAll } = appointmentState;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(initialSection === 'guia');
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(initialSection === 'simulador');
  const [isGestorExpanded, setIsGestorExpanded] = useState(initialSection === 'gestor');
  const [theme, setTheme] = useState<Theme>('corporativo');
  const [api, setApi] = useState<CarouselApi>();
  const [timerKey, setTimerKey] = useState(0);
  const { toast } = useToast();

  const statsRef = useRef(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('finanto-theme') as Theme;
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      applyTheme('corporativo');
    }

    if (!initialSection) {
      const hasVisited = localStorage.getItem(Service.STORAGE_KEY);
      if (!hasVisited) {
        setShowHelp(true);
      }
    }
  }, [initialSection]);

  useEffect(() => {
    if (showHelp) {
      document.title = "Manual de Inicio - Finanto";
    } else if (isSimulatorExpanded) {
      document.title = "Simulador - Finanto";
    } else if (isGestorExpanded) {
      document.title = "Gestor - Finanto";
    } else {
      document.title = "Finanto - Gestión Inmobiliaria";
    }
  }, [showHelp, isSimulatorExpanded, isGestorExpanded]);

  useEffect(() => {
    if (!api) return;
    const intervalId = setInterval(() => api.scrollNext(), 18000);
    return () => clearInterval(intervalId);
  }, [api, timerKey]);

  useEffect(() => {
    if (!isLoaded) return;

    // Notificación de Bienvenida a los 4 segundos
    const welcomeTimer = setTimeout(() => {
      toast({
        title: "¡Bienvenido a Finanto!",
        description: "Listo para el éxito inmobiliario. Tu agenda y herramientas están sincronizadas.",
      });
    }, 4000);

    const checkConfirmations = () => {
      const currentStats = statsRef.current;
      const unconfirmed = currentStats.todayCount - currentStats.todayConfirmed;
      if (unconfirmed > 0) {
        toast({
          variant: "warning",
          title: "Acción Requerida",
          description: `Faltan ${unconfirmed} ${unconfirmed === 1 ? 'cita' : 'citas'} de hoy por confirmar asistencia.`,
        });
      }
    };

    // Primer recordatorio de confirmación a los 20 segundos
    const initialTimer = setTimeout(checkConfirmations, 20000);

    // Recordatorio recurrente cada 20 minutos
    const intervalTimer = setInterval(checkConfirmations, 1200000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isLoaded, toast]);

  const resetTimer = useCallback(() => setTimerKey(prev => prev + 1), []);
  const handleNext = useCallback(() => { if (api) { api.scrollNext(); resetTimer(); } }, [api, resetTimer]);
  const handlePrev = useCallback(() => { if (api) { api.scrollPrev(); resetTimer(); } }, [api, resetTimer]);

  const applyTheme = (themeId: Theme) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    if (themeId === 'corporativo' || themeId === 'corporativo-v2') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleThemeChange = (themeId: Theme) => {
    applyTheme(themeId);
    localStorage.setItem('finanto-theme', themeId);
    toast({ title: "Tema actualizado", description: `Tema ${themeId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} aplicado.` });
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[12px] bg-card/10 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold tracking-tight text-foreground leading-none">
                  Finanto <span className="text-primary">BETA</span>
                </h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold uppercase border border-primary/20" 
                  onClick={() => setShowHelp(true)}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" /> Tutorial
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium opacity-60 mt-1">Por Olivares</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden">
                  {theme === 'moderno' ? <Cpu className="w-5 h-5 text-primary" /> : theme === 'corporativo' ? <Sun className="w-5 h-5 text-primary" /> : theme === 'discreto' ? <Moon className="w-5 h-5 text-primary" /> : theme === 'olivares' ? <Crown className="w-5 h-5 text-primary" /> : theme === 'gelido' ? <Snowflake className="w-5 h-5 text-primary" /> : theme === 'corporativo-v2' ? <MessageSquare className="w-5 h-5 text-primary" /> : <Palette className="w-5 h-5 text-primary" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-lg">
                <DropdownMenuLabel>Temas Visuales</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { id: 'corporativo', label: 'Corporativo', icon: Sun, color: 'bg-blue-600' },
                  { id: 'corporativo-v2', label: 'Corporativo V2', icon: MessageSquare, color: 'bg-[#1877F2]' },
                  { id: 'tranquilo', label: 'Tranquilo', icon: Palette, color: 'bg-primary' },
                  { id: 'moderno', label: 'Moderno', icon: Cpu, color: 'bg-cyan-500' },
                  { id: 'discreto', label: 'Discreto', icon: Moon, color: 'bg-slate-700' },
                  { id: 'olivares', label: 'Olivares', icon: Crown, color: 'bg-yellow-600' },
                  { id: 'gelido', label: 'Gélido', icon: Snowflake, color: 'bg-blue-300' },
                ].map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => handleThemeChange(t.id as Theme)} className="cursor-pointer">
                    <t.icon className="w-4 h-4 text-muted-foreground mr-2" />
                    <div className={cn("w-2 h-2 rounded-full mr-2", t.color)} /> {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Citas hoy', value: stats.todayCount.toString(), icon: CalendarDays, color: 'text-primary' },
            { label: 'Pendientes', value: stats.pendingCount.toString(), icon: Wallet, color: 'text-primary' },
            { 
              label: 'Prospectos Mes', 
              value: stats.currentMonthProspects.toString(), 
              icon: Users, 
              color: 'text-accent',
              comparison: stats.lastMonthProspects 
            },
            { 
              label: 'Ventas Mes', 
              value: stats.currentMonthSales.toString(), 
              icon: CheckCircle2, 
              color: 'text-green-500',
              comparison: stats.lastMonthSales
            },
          ].map((stat, i) => (
            <Card 
              key={i} 
              className="bg-card/30 backdrop-blur-md border-border/40 animate-periodic-glow hover:border-primary/50 transition-all cursor-default"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-full bg-muted/50", stat.color)}><stat.icon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold">{stat.value}</p>
                    {stat.comparison !== undefined && (
                      <span className="text-[9px] font-bold flex items-center whitespace-nowrap text-muted-foreground/40">
                        {parseInt(stat.value) > stat.comparison ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : parseInt(stat.value) < stat.comparison ? <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" /> : null}
                        {stat.comparison} <span className="ml-1 font-medium text-muted-foreground/30">mes pasado</span>
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-5 space-y-6">
            <CreditCalculator 
              initialExpanded={initialSection === 'simulador'} 
              onExpandedChange={setIsSimulatorExpanded}
            />
            <div className="p-6 border rounded-xl border-primary/20 bg-primary/5">
              <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {APP_TIPS.map((tip, index) => (
                    <CarouselItem key={index}>
                      <div className="space-y-1">
                        <h3 className={cn("text-xs font-bold flex items-center gap-2", tip.color)}>
                          <tip.icon className="w-3.5 h-3.5" /> {tip.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{tip.text}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-1 mt-3">
                  <CarouselPrevious onClick={handlePrev} className="static h-6 w-6 border-primary/20 bg-transparent" />
                  <CarouselNext onClick={handleNext} className="static h-6 w-6 border-primary/20 bg-transparent" />
                </div>
              </Carousel>
            </div>
          </section>
          <section className="xl:col-span-7 pb-10">
            <AppointmentsDashboard 
              initialExpanded={initialSection === 'gestor'}
              onExpandedChange={setIsGestorExpanded}
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

      <footer className="border-t border-border/40 py-6 bg-card/10 backdrop-blur-md">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">Finanto v1.1</span>
            <span>© 2026 - Sistema de Gestión Inmobiliaria</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-7 text-[10px] hover:text-destructive" onClick={() => setShowClearConfirm(true)}>
              <Trash2 className="w-3 h-3 mr-1" /> Limpiar Datos
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setShowResetConfirm(true)}>
              <RotateCcw className="w-3 h-3 mr-1" /> Reiniciar Seed
            </Button>
          </div>
        </div>
      </footer>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar reinicio?</AlertDialogTitle>
            <AlertDialogDescription>Se borrará tu información actual para restaurar los datos de prueba iniciales.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { resetData(); setShowResetConfirm(false); toast({ title: "Datos restaurados" }); }}>Sí, reiniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción borrará todas tus citas permanentemente. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { clearAll(); setShowClearConfirm(false); toast({ title: "Base de datos limpia", variant: "destructive" }); }} className="bg-destructive hover:bg-destructive/90 text-white">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent 
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden bg-card shadow-2xl"
        >
          <DialogHeader className="p-6 border-b bg-primary/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 border border-primary/30 rounded-xl bg-primary/10">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold font-headline">Guía de Inicio Rápido</DialogTitle>
                <DialogDescription className="text-xs">Aprende a usar Finanto en 3 simples pasos</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-10 pb-20">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Paso 1: Proyecta un Crédito</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-2 border-primary/20">
                  <p>Cuando un cliente te pregunte montos, usa la <strong>Calculadora Rápida</strong>:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Ingresa el monto del crédito para obtener mensualidad e ingreso mínimo al instante.</li>
                    <li>Usa el <strong>Icono de Expansión</strong> <Maximize2 className="inline w-3 h-3" /> para mostrar una vista profesional al cliente sin distracciones.</li>
                    <li>Haz clic en <strong>Copiar Resumen</strong> para mandar una ficha técnica por WhatsApp.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <CalendarClock className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Paso 2: Gestiona tu Agenda</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-2 border-accent/20">
                  <p>Registra a cada interesado para no perder su contacto:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Usa el formulario de <strong>Nueva Cita</strong> para anotar nombre, teléfono y fecha.</li>
                    <li>En las citas de "Hoy", usa el botón <strong>Confirmar</strong> para validar si el cliente asistirá.</li>
                    <li>Usa el botón <strong>Reporte Diario</strong> para enviar tus estadísticas del día a tu equipo.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-green-500">
                  <Star className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Paso 3: Registra tus Cierres</h3>
                </div>
                <div className="pl-7 space-y-3 text-sm text-muted-foreground border-l-2 border-green-500/20">
                  <p>Al concretar una venta, marca la cita como <strong>✨ Cierre ✨</strong>:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Verás una celebración y recomendaciones para tu expediente.</li>
                    <li>Usa las <strong>Notas del cliente</strong> para registrar montos finales y comisiones.</li>
                    <li>Consulta tu historial en cualquier momento para dar seguimiento.</li>
                  </ul>
                </div>
              </section>

              <div className="p-6 border border-destructive/20 rounded-2xl bg-destructive/5 flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-1" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-destructive">Nota Importante de Seguridad</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tus datos se guardan <strong>solo en este navegador</strong>. No borres el caché o historial si no quieres perder tus registros. Contacta a Olivares para dudas técnicas.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t bg-muted/20">
            <Button onClick={() => setShowHelp(false)} className="w-full h-10 font-bold rounded-xl shadow-lg">
              ¡Entendido, comencemos!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
