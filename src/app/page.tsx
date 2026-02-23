"use client"

import React, { useState, useEffect } from 'react';
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
  Target
} from 'lucide-react';
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
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Theme = 'predeterminado' | 'discreto' | 'corporativo' | 'moderno';

export default function Home() {
  const appointmentState = useAppointments();
  const { stats, isLoaded, resetData } = appointmentState;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState<Theme>('predeterminado');
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('finanto-theme') as Theme;
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }, []);

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
      title: "Sistema de Financiamiento reiniciado",
      description: "Todos los datos locales han sido borrados y restaurados con datos de prueba.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border/40 sticky top-0 z-50 backdrop-blur-[20px] bg-card/10">
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

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-5">
            <div className="sticky top-24">
              <CreditCalculator />
              <div className="mt-6 p-6 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md">
                <h3 className="text-sm font-headline font-bold mb-2 flex items-center gap-2 text-primary">
                   💡 Perfilamiento Profesional (v0.7.1)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Utilice la calculadora para proyecciones en tiempo real durante llamadas o consultas presenciales de financiamiento. 
                  <br />
                  <br />
                  Este sistema garantiza la <strong>privacidad técnica</strong> al almacenar los datos exclusivamente en este equipo.
                </p>
              </div>
            </div>
          </section>

          <section className="xl:col-span-7 space-y-8">
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

      <footer className="mt-12 border-t border-border/40 py-8 bg-card/10 backdrop-blur-[20px]">
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
              Esta acción borrará todas tus citas, notas y configuraciones guardadas en este navegador. Se restaurarán los datos de prueba iniciales.
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
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] bg-card border-border backdrop-blur-3xl overflow-hidden flex flex-col p-0 shadow-2xl">
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
          
          <ScrollArea className="flex-1 p-8">
            <div className="space-y-10 text-foreground/90 pb-12">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
                  Introducción al Sistema
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Finanto es una plataforma técnica diseñada para optimizar la eficiencia operativa del ejecutivo. Facilita el perfilamiento rápido de prospectos y garantiza una administración impecable de la agenda diaria.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-muted/30 border-border/50 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-accent">
                      <Wallet className="w-5 h-5" /> 1. Calculadora de Precisión
                    </h3>
                    <ul className="text-sm space-y-3 list-disc pl-5 text-muted-foreground">
                      <li><strong>Perfilamiento en tiempo real:</strong> Determine montos aproximados de forma inmediata para interesados por teléfono.</li>
                      <li><strong>Tanteo Financiero:</strong> Realice ajustes de montos frente al cliente para encontrar su capacidad ideal durante la 1ra consulta.</li>
                      <li><strong>Independencia de Red:</strong> Herramienta optimizada para operar sin dependencia de conexión a servidores externos.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-accent">
                      <CalendarDays className="w-5 h-5" /> 2. Gestión de Agenda
                    </h3>
                    <ul className="text-sm space-y-3 list-disc pl-5 text-muted-foreground">
                      <li><strong>Priorización Diaria:</strong> El sistema organiza las citas del día para maximizar la productividad operativa.</li>
                      <li><strong>Optimización Logística:</strong> Valide la confirmación de asistencia para evitar tiempos muertos y desplazamientos en vano.</li>
                      <li><strong>Trazabilidad de Prospectos:</strong> Centraliza cada acuerdo y resultado de cita para un seguimiento robusto.</li>
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
                  El sistema monitorea automáticamente su desempeño mensual. Compare sus cierres y prospectos con periodos anteriores para identificar áreas de oportunidad y mantener un flujo constante de expedientes de financiamiento.
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
                    <span><strong>Seguridad Local:</strong> Los datos residen exclusivamente en su navegador. Esto garantiza que la información sensible de clientes sea privada.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Respaldo Técnico:</strong> No borre el historial si desea conservar sus registros. La sincronización en servidor es una funcionalidad planeada para el futuro.</span>
                  </li>
                </ul>
              </section>

              <p className="text-center text-xs text-muted-foreground italic pt-6 border-t border-border/20">
                Finanto: Diseñado para el ejecutivo que prioriza el control técnico y el cierre efectivo en financiamiento inmobiliario.
              </p>
            </div>
          </ScrollArea>
          
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
