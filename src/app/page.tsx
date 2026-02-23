"use client"

import React, { useState, useEffect, useCallback } from 'react';
import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, Wallet, CalendarDays, Users, CheckCircle2, ShieldCheck, TrendingUp, RotateCcw,
  Palette, Moon, Sun, Cpu, Phone, BookOpen, Info, Calculator, Maximize2, Sparkles, History,
  ClipboardList, Target, Calendar, Copy, Crown, Zap, Snowflake, Trash2, Rocket, ShieldAlert,
  Smartphone, MessageSquare, CalendarClock, Coins
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

type Theme = 'predeterminado' | 'corporativo' | 'corporativo-v2' | 'moderno' | 'discreto' | 'olivares' | 'neon' | 'gelido';

const APP_TIPS = [
  { icon: Calculator, title: "Calculadora Rápida", color: "text-primary", text: "Usa la calculadora rapida en caso de tener una llamada con un interesado que pregunte montos aproximados." },
  { icon: ClipboardList, title: "Gestión Eficiente", color: "text-accent", text: "Nunca olvides registrar todas tus citas en el gestionador de citas, para tener un orden eficiente de fechas y datos en un solo lugar." },
  { icon: ShieldCheck, title: "Seguridad de Datos", color: "text-destructive", text: "Recuerda, tus citas son guardadas dentro de este navegador, si cambias de navegador o de dispositivo contacta al desarrollador." },
  { icon: Sparkles, title: "Próximas Mejoras", color: "text-yellow-500", text: "Esta es una versión funcional para cálculo inteligente y gestión de citas, en un futuro: datos en la nube, con cuentas, monitoreo por parte de líderes y gerencia, IA para automatización de mensajes personalizados, una guía de capacitación, etc." },
  { icon: Maximize2, title: "Calculadora Completa", color: "text-primary", text: "Usa la calculadora completa para no tantear números a la hora de tener la cita frente tuyo o al estar en una llamada extensa" },
  { icon: Palette, title: "Imagen Corporativa", color: "text-accent", text: "Usa el tema <<corporativo>> para mostrar pantalla a tus clientes presenciales." },
  { icon: Palette, title: "Personalización", color: "text-primary", text: "Cambia de tema en la esquina superior de este sistema web, ya sea que prefieras lo corporativo, lo ligero o vibes de hacker." },
  { icon: Copy, title: "Envío a WhatsApp", color: "text-green-500", text: "Recuerda copiar los datos de cada cliente para mandarlos por el grupo de WhatsApp: Click en la cita, click en el botón verde <<Copiar>>, y pegar datos en el chat del grupo." },
  { icon: TrendingUp, title: "Apoyo en Cierres", color: "text-accent", text: "Recuerda que la calculadora extendida sirve como apoyo para explicar la línea e información extra a la hora de intentar cerrar ventas." },
  { icon: History, title: "Historial Técnico", color: "text-muted-foreground", text: "No borres tus citas pasadas, sirven para ver tu progreso o no perderte en tu memoria a la hora de dar seguimiento." },
  { icon: ClipboardList, title: "Memoria de Datos", color: "text-primary", text: "Recuerda anotar datos útiles del cliente en las notas de su cita para no tener que recordar, solo consultar tus datos." },
  { icon: Calendar, title: "Control de Agenda", color: "text-accent", text: "Con una buena gestión de citas te ahorras problemas con la perdida de números, olvidar confirmaciones, etc." },
  { icon: Copy, title: "Ahorro de Tiempo", color: "text-green-500", text: "Los botones de <<Copiar>> te pueden llegar a ahorrar mucho texto escrito y confundir datos de diferentes prospectos." },
  { icon: Info, title: "Retroalimentación", color: "text-primary", text: "Alguna sugerencia, lo mas minima que sea, comentar al ejecutivo Olivares sin pena, lo que importa es la organización, comodidad y eficiencia de prospectadores." },
  { icon: Users, title: "Perfil de Usuario", color: "text-accent", text: "Este sistema está enfocado en prospectadores, pero sirve para vendedores igualmente." },
  { icon: Target, title: "Flujo de Trabajo", color: "text-yellow-500", text: "Este sistema te ahorra el inventarte tu propio flujo de trabajo (distintos excels confusos, hojas de citas sin fin, y otras maneras de gestión)." },
  { icon: Users, title: "Cultura de Equipo", color: "text-primary", text: "La mejor forma de cooperación en equipo es una donde todos van en un mismo canal de progreso constante, no un espagueti de procesos diferentes cada uno." }
];

export default function Home() {
  const appointmentState = useAppointments();
  const { stats, isLoaded, resetData, clearAll } = appointmentState;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState<Theme>('predeterminado');
  const [api, setApi] = useState<CarouselApi>();
  const [timerKey, setTimerKey] = useState(0);
  const [statsKey, setStatsKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('finanto-theme') as Theme;
    if (savedTheme) applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!api) return;
    const intervalId = setInterval(() => api.scrollNext(), 18000);
    return () => clearInterval(intervalId);
  }, [api, timerKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatsKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const resetTimer = useCallback(() => setTimerKey(prev => prev + 1), []);
  const handleNext = useCallback(() => { if (api) { api.scrollNext(); resetTimer(); } }, [api, resetTimer]);
  const handlePrev = useCallback(() => { if (api) { api.scrollPrev(); resetTimer(); } }, [api, resetTimer]);

  const applyTheme = (themeId: Theme) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    if (themeId.startsWith('corporativo')) document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  };

  const handleThemeChange = (themeId: Theme) => {
    applyTheme(themeId);
    localStorage.setItem('finanto-theme', themeId);
    toast({ title: "Tema actualizado", description: `Se ha aplicado el tema ${themeId.replace('-', ' ').charAt(0).toUpperCase() + themeId.slice(1)}.` });
  };

  const copyFooterPhone = () => {
    navigator.clipboard.writeText("6646947418");
    toast({
      title: "Número copiado",
      description: "664 694 7418 copiado al portapapeles.",
    });
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[20px] bg-card/10 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-headline font-bold tracking-tight text-foreground leading-none">
                Finanto <span className="text-primary">BETA</span>
              </h1>
              <span className="text-[10px] text-muted-foreground font-medium opacity-60 mt-1">Por Olivares</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-1 select-none pointer-events-none">
              <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-none">v1.1</span>
              <span className="text-[9px] text-muted-foreground/50 font-medium">23 - Marzo</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden backdrop-blur-md">
                  {theme === 'moderno' ? <Cpu className="w-5 h-5 text-primary" /> : theme.startsWith('corporativo') ? <Sun className="w-5 h-5 text-primary" /> : theme === 'discreto' ? <Moon className="w-5 h-5 text-primary" /> : theme === 'olivares' ? <Crown className="w-5 h-5 text-primary" /> : <Palette className="w-5 h-5 text-primary" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-2xl bg-popover border-border/30">
                <DropdownMenuLabel className="text-foreground">Temas de Ejecutivos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { id: 'predeterminado', label: 'Predeterminado', icon: Palette, color: 'bg-primary' },
                  { id: 'corporativo', label: 'Corporativo', icon: Sun, color: 'bg-blue-600' },
                  { id: 'corporativo-v2', label: 'Corporativo v2', icon: ShieldCheck, color: 'bg-emerald-500' },
                  { id: 'moderno', label: 'Moderno', icon: Cpu, color: 'bg-cyan-500' },
                  { id: 'discreto', label: 'Discreto', icon: Moon, color: 'bg-slate-700' },
                  { id: 'olivares', label: 'Olivares', icon: Crown, color: 'bg-yellow-600' },
                  { id: 'neon', label: 'Neón', icon: Zap, color: 'bg-pink-500' },
                  { id: 'gelido', label: 'Gélido', icon: Snowflake, color: 'bg-blue-300' },
                ].map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => handleThemeChange(t.id as Theme)} className="flex items-center gap-2 cursor-pointer">
                    <t.icon className="w-4 h-4 text-muted-foreground" />
                    <div className={cn("w-2.5 h-2.5 rounded-full", t.color)} /> {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 flex flex-col">
        <div key={statsKey} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink-0">
          {[
            { label: 'Citas hoy', value: stats.todayCount.toString(), icon: CalendarDays, color: 'text-primary' },
            { label: 'Citas pendientes', value: stats.pendingCount.toString(), icon: Wallet, color: 'text-primary' },
            { label: 'Prospectos (mes)', value: stats.currentMonthProspects.toString(), icon: Users, color: 'text-accent', subValue: stats.lastMonthProspects, subLabel: 'Mes pasado' },
            { label: 'Cierres', value: stats.currentMonthSales.toString(), icon: CheckCircle2, color: 'text-green-500', subValue: stats.lastMonthSales, subLabel: 'Mes pasado' },
          ].map((stat, i) => (
            <Card 
              key={i} 
              className={cn(
                "border border-transparent bg-card/30 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-card/50",
                "animate-entrance-glow"
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-full bg-muted/50 ${stat.color} backdrop-blur-md`}><stat.icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold truncate">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-headline font-bold text-foreground">{stat.value}</p>
                    {stat.subValue !== undefined && <div className="flex items-center text-[10px] font-medium text-muted-foreground"><TrendingUp className="w-2.5 h-2.5 mr-0.5 opacity-50" /><span>{stat.subValue} <span className="opacity-50">({stat.subLabel})</span></span></div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 items-start flex-1 xl:grid-cols-12">
          <section className="xl:col-span-5">
            <div className="sticky top-24 space-y-6">
              <CreditCalculator />
              <div className="relative p-6 overflow-hidden border rounded-xl border-primary/20 bg-primary/5 backdrop-blur-md group">
                <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: true }}>
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
                    <CarouselPrevious onClick={handlePrev} className="static h-8 w-8 translate-y-0 border-primary/20 bg-transparent" />
                    <CarouselNext onClick={handleNext} className="static h-8 w-8 translate-y-0 border-primary/20 bg-transparent" />
                  </div>
                </Carousel>
              </div>
            </div>
          </section>
          <section className="pb-10 space-y-8 xl:col-span-7">
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
        <div className="container flex flex-col items-center justify-between gap-4 px-4 mx-auto text-sm md:flex-row text-muted-foreground">
          <p>© 2026 Finanto - Ejecutivo en Financiamiento Inmobiliario</p>
          <div className="flex items-center gap-6">
            <button 
              onClick={copyFooterPhone}
              className="flex items-center gap-2 transition-colors cursor-pointer hover:text-primary group"
            >
              <Phone className="w-3.5 h-3.5 group-hover:animate-pulse" />
              <span>664 694 7418</span>
            </button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase" onClick={() => setShowHelp(true)}>
                <BookOpen className="w-3 h-3 mr-1" /> Guía
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase hover:text-destructive" onClick={() => setShowClearConfirm(true)}>
                <Trash2 className="w-3 h-3 mr-1" /> Limpiar Todo
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase" onClick={() => setShowResetConfirm(true)}>
                <RotateCcw className="w-3 h-3 mr-1" /> Reiniciar (Semillas)
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar reinicio con semillas?</AlertDialogTitle>
            <AlertDialogDescription>Se restaurarán los datos de prueba iniciales de la financiera. Se borrará tu información actual.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { resetData(); setShowResetConfirm(false); toast({ title: "Datos reiniciados" }); }}>Sí, reiniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Limpiar base de datos por completo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará todas las citas y dejará el sistema vacío. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { clearAll(); setShowClearConfirm(false); toast({ title: "Base de datos limpia", variant: "destructive" }); }} className="text-white bg-destructive hover:bg-destructive/90">
              Eliminar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0 overflow-hidden bg-card backdrop-blur-3xl shadow-2xl border-border">
          <DialogHeader className="p-8 border-b shrink-0 border-border/50 bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-4 border border-primary/30 rounded-2xl bg-primary/20">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold font-headline">Manual Técnico de Finanto</DialogTitle>
                <DialogDescription className="text-sm font-medium">Guía de Inducción v1.1 - Perfilado, Gestión y Cierre</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 w-full">
            <div className="p-8 pb-20 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Rocket className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold font-headline">La Nueva Onda de Financiamiento</h2>
                </div>
                <div className="p-6 border bg-muted/30 rounded-2xl border-border/50 space-y-4">
                  <p className="leading-relaxed text-muted-foreground">
                    Bienvenido al sistema que redefine tu operación diaria. Finanto no es solo un registro; es tu aliado táctico para que cada llamada sea un perfilamiento profesional y cada cita tenga una estructura administrativa impecable.
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-accent/20 text-accent mt-0.5"><Target className="w-4 h-4" /></div>
                      <p className="text-xs font-medium"><span className="font-bold text-foreground">Prospectadores:</span> Cierra el ciclo de interés con números precisos desde el minuto uno.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-green-500/20 text-green-500 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                      <p className="text-xs font-medium"><span className="font-bold text-foreground">Vendedores:</span> Domina la presentación de gastos y perfilamiento frente al cliente.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="flex items-center gap-2 pl-4 text-xl font-bold border-l-4 border-l-primary">Pilares Operativos</h3>
                <div className="grid items-start grid-cols-1 gap-6 md:grid-cols-12">
                  <div className="space-y-3 md:col-span-4">
                    <div className="p-3 border rounded-xl bg-primary/10 border-primary/20 w-fit">
                      <Calculator className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-bold">Perfilamiento Inteligente</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">Olvídate de "tantear" montos. Ingresa el crédito y obtén enganche, mensualidad e ingreso mínimo al instante.</p>
                  </div>
                  <Card className="overflow-hidden shadow-none md:col-span-8 bg-muted/20 border-border/40">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Maximize2 className="w-3.5 h-3.5" /> Modo Presentación Profesional</div>
                      <p className="text-xs text-muted-foreground">Presiona el botón de expansión <Maximize2 className="inline w-3 h-3" /> para entrar en el modo pantalla completa. Ideal para mostrar al cliente su estructura financiera sin distracciones.</p>
                      <Separator className="bg-border/30" />
                      <div className="w-full p-4 border rounded-xl bg-primary/5 border-primary/10">
                        <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-2 mb-2">
                          <Copy className="w-3.5 h-3.5" /> Protip del Experto:
                        </span>
                        <p className="text-xs italic leading-relaxed text-muted-foreground">
                          Copia el resumen rápido con el boton que dice copiar, y lo pegas en las notas de la cita, asi no se te escapan datos en una 2da cita
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid items-start grid-cols-1 gap-6 md:grid-cols-12">
                  <Card className="order-2 overflow-hidden shadow-none md:col-span-8 bg-muted/20 border-border/40 md:order-1">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent"><CalendarClock className="w-3.5 h-3.5" /> Gestión de Tiempos Muertos</div>
                      <p className="text-xs text-muted-foreground">Cada cita de hoy tiene un botón de confirmación. Úsalo para validar si el cliente asistirá y evitar desplazamientos innecesarios a la financiera.</p>
                      <Separator className="bg-border/30" />
                      <ul className="text-[10px] space-y-2">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <span className="font-bold">Azul:</span> Citas para hoy (Prioridad 1).</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /> <span className="font-bold">Gris:</span> Citas futuras (Preparación).</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <div className="order-1 space-y-3 md:col-span-4 md:order-2">
                    <div className="p-3 border rounded-xl bg-accent/10 border-accent/20 w-fit">
                      <CalendarDays className="w-6 h-6 text-accent" />
                    </div>
                    <h4 className="text-lg font-bold">Control de Agenda</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">No pierdas un solo número. Registra nombre, teléfono y motivo de la consulta. Las notas son tu memoria técnica.</p>
                  </div>
                </div>
              </section>

              <section className="p-8 rounded-[2rem] bg-green-500/5 border border-green-500/20 space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                  <h3 className="text-2xl font-bold font-headline">El Sello del Cierre</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Cuando concretes una operación, marca la cita con el estatus <span className="font-bold text-green-500">✨ Cierre ✨</span>. Esto activará el checklist administrativo para que no olvides registrar:
                </p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { label: "Monto Final", icon: Wallet },
                    { label: "Comisiones", icon: Coins },
                    { label: "Fecha Firma", icon: Calendar },
                    { label: "Notas Extra", icon: Info }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 border rounded-xl bg-white/5 border-white/5">
                      <item.icon className="w-4 h-4 text-green-400" />
                      <span className="text-[10px] font-bold text-center uppercase tracking-tighter">{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-6 space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-yellow-500"><Sparkles className="w-5 h-5" /> Visión Futura (Próximamente)</h4>
                    <ul className="text-xs space-y-3 text-muted-foreground">
                      <li className="flex gap-2">
                        <div className="shrink-0 mt-1"><MessageSquare className="w-3 h-3 text-primary" /></div>
                        <span><span className="font-bold text-foreground">Automatización IA:</span> Generación de mensajes personalizados para seguimiento según el estatus de la cita.</span>
                      </li>
                      <li className="flex gap-2">
                        <div className="shrink-0 mt-1"><Smartphone className="w-3 h-3 text-primary" /></div>
                        <span><span className="font-bold text-foreground">Sincronización en Nube:</span> Tus datos siempre contigo, en cualquier dispositivo con tu cuenta oficial.</span>
                      </li>
                      <li className="flex gap-2">
                        <div className="shrink-0 mt-1"><TrendingUp className="w-3 h-3 text-primary" /></div>
                        <span><span className="font-bold text-foreground">Panel de Gerencia:</span> Monitoreo de productividad en tiempo real para líderes de equipo.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-6 border border-destructive/20 rounded-2xl bg-destructive/5 space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-destructive"><ShieldAlert className="w-5 h-5" /> Nota de Seguridad</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Actualmente, tus datos se almacenan de forma segura <span className="font-bold text-foreground">solo en este navegador</span>. 
                    </p>
                    <p className="text-[10px] font-bold text-destructive uppercase">
                      ¡CUIDADO! NO BORRES EL CACHÉ O HISTORIAL DE DATOS DEL NAVEGADOR SIN RESPALDAR TUS CITAS.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-6 border-t shrink-0 border-border/50 bg-muted/20">
            <Button onClick={() => setShowHelp(false)} className="w-full h-12 px-10 font-bold shadow-lg max-w-none sm:w-auto rounded-xl transition-transform hover:scale-105 active:scale-95">
              ¡Entendido, a cerrar ventas!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
