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
  Star
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
      title: "Sistema reiniciado",
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
              <span className="text-[10px] text-primary uppercase tracking-tighter font-medium">Datos guardados en el navegador</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden backdrop-blur-md">
                  {theme === 'moderno' ? <Cpu className="w-5 h-5 text-primary" /> : theme === 'corporativo' ? <Sun className="w-5 h-5 text-primary" /> : theme === 'discreto' ? <Moon className="w-5 h-5 text-primary" /> : <Palette className="w-5 h-5 text-primary" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 backdrop-blur-2xl bg-popover border-border/30">
                <DropdownMenuLabel className="text-foreground/80 dark:text-foreground">Temas</DropdownMenuLabel>
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
            <Card key={i} className="bg-card/30 border-border/50 backdrop-blur-xl hover:border-primary/30 transition-all group">
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
                   💡 Nota del sistema (v0.7.1)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta versión incluye el nuevo <strong>"Panel de felicitación por cierre"</strong> y una calculadora optimizada para pantallas grandes.
                  <br />
                  <br />
                  Toda tu información se guarda de forma privada en este navegador para que puedas trabajar con rapidez y seguridad.
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
          <p>© 2026 Finanto - Tu asistente digital de crédito</p>
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
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] bg-card border-border backdrop-blur-3xl overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-headline font-bold">Guía de Usuario - Finanto</DialogTitle>
                <DialogDescription>Manual interactivo para el asesor hipotecario (v0.7.1)</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-8">
            <div className="space-y-8 text-foreground/90">
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                  ¡Bienvenido a Finanto!
                </h2>
                <p className="text-sm leading-relaxed">
                  Esta es una herramienta diseñada especialmente para que los asesores hipotecarios puedan ser más rápidos, organizados y profesionales frente a sus clientes.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold flex items-center gap-2 text-accent">
                      <Wallet className="w-4 h-4" /> 1. Calculadora inteligente
                    </h3>
                    <ul className="text-xs space-y-2 list-disc pl-4 text-muted-foreground">
                      <li><strong>Cálculos instantáneos:</strong> Solo pon el monto del crédito y el sistema te dirá la mensualidad y el enganche automáticamente.</li>
                      <li><strong>Modo presentación:</strong> Si le das al botón de "Pantalla completa", tendrás una vista profesional para mostrar números al cliente.</li>
                      <li><strong>Resumen WhatsApp:</strong> Copia un resumen profesional de la cotización con un solo clic.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold flex items-center gap-2 text-accent">
                      <CalendarDays className="w-4 h-4" /> 2. Control de agenda
                    </h3>
                    <ul className="text-xs space-y-2 list-disc pl-4 text-muted-foreground">
                      <li><strong>Organización diaria:</strong> Mira tus citas de hoy en un panel destacado.</li>
                      <li><strong>Confirmación:</strong> Marca si el cliente confirmó su asistencia con un clic.</li>
                      <li><strong>Historial:</strong> Guarda qué pasó en cada cita (cierre, apartado, reagendado).</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-green-500">
                  <Star className="w-5 h-5" /> 3. Celebración de éxitos
                </h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Recompensa por cierre:</strong> Cuando logres concretar un trámite y lo marques como "Cierre", el sistema te felicitará con un sonido y un panel especial para registrar los datos finales del éxito.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                  <Cpu className="w-5 h-5" /> 4. Asistente de mensajes IA
                </h3>
                <p className="text-sm text-muted-foreground">
                  <strong>No más bloqueos:</strong> El sistema puede redactar por ti mensajes de seguimiento profesionales dependiendo de lo que haya pasado en la cita (ej. si el cliente no llegó o si ya apartó).
                </p>
              </section>

              <Separator className="bg-border/50" />

              <section className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-accent uppercase tracking-widest">
                  <Info className="w-4 h-4" /> Información Importante
                </h3>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />
                    <span><strong>Privacidad:</strong> Toda la información se guarda únicamente en el navegador (Chrome, Edge, etc.) de tu dispositivo actual.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />
                    <span><strong>Recomendación:</strong> Si cambias de dispositivo o borras el historial, los datos se reiniciarán. ¡Pronto tendremos sincronización en la nube!</span>
                  </li>
                </ul>
              </section>

              <p className="text-center text-[10px] text-muted-foreground italic pt-4">
                Desarrollado para que te enfoques en lo que mejor sabes hacer: ¡Cerrar créditos y ayudar a familias a tener su hogar!
              </p>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t border-border/50 bg-muted/20">
            <Button onClick={() => setShowHelp(false)} className="w-full sm:w-auto font-bold">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
