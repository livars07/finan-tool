
"use client"

import React, { useState } from 'react';
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
  RotateCcw 
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
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const appointmentState = useAppointments();
  const { stats, isLoaded, resetData } = appointmentState;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();

  if (!isLoaded) return null;

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    toast({
      title: "Sistema Reiniciado",
      description: "Todos los datos locales han sido borrados y restaurados con datos de prueba.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
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
              <LayoutDashboard className="w-4 h-4" />v0.4 ( 22 de marzo )
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className="text-xs font-semibold text-foreground">Ejecutivo Finanto</span>
              <span className="text-[10px] text-primary uppercase tracking-tighter font-medium">Datos guardados en navegador</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Citas Hoy', 
              value: stats.todayCount.toString(), 
              icon: CalendarDays, 
              color: 'text-primary'
            },
            { 
              label: 'Citas Pendientes', 
              value: stats.pendingCount.toString(), 
              icon: Wallet, 
              color: 'text-primary'
            },
            { 
              label: 'Prospectos (Mes)', 
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
              color: 'text-green-400',
              subValue: stats.lastMonthSales,
              subLabel: 'Mes pasado'
            },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/40 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-full bg-muted/50 ${stat.color}`}>
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
              <div className="mt-6 p-6 rounded-xl border border-primary/20 bg-primary/5">
                <h3 className="text-sm font-headline font-bold mb-2 flex items-center gap-2 text-primary">
                   💡 Notas
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Primera versión funcional, capaz de calcular mensualidades y enganche, y de gestionar citas ordenadamente, guardando los datos DENTRO DEL NAVEGADOR (próximamente a una base de datos).
                  <br />
                  <br />
                  Esta beta logra cumplir funciones útiles y esenciales para prospección, y busco en las siguientes semanas volver más eficiente la prospección, gestión de citas, gestión de ventas y comisiones individuales, etc.
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
              deleteAppointment={appointmentState.deleteAppointment}
              editAppointment={appointmentState.editAppointment}
              toggleConfirmation={appointmentState.toggleConfirmation}
              formatFriendlyDate={appointmentState.formatFriendlyDate}
              format12hTime={appointmentState.format12hTime}
            />
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-border/40 py-8 bg-card/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
          <p>© 2026 Finanto - Gestión Hipotecaria</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-primary transition-colors cursor-pointer">664 694 7418</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-[10px] font-bold uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reiniciar sistema
            </Button>
          </div>
        </div>
      </footer>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar reinicio total?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borrará todas tus citas, notas y configuraciones guardadas en este navegador. Se restaurarán los datos de prueba iniciales. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Sí, reiniciar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
