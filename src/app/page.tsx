"use client"

import CreditCalculator from '@/components/calculator/CreditCalculator';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Wallet, CalendarDays, Users, CheckCircle2 } from 'lucide-react';
import { useAppointments } from '@/hooks/use-appointments';

export default function Home() {
  const { stats, isLoaded } = useAppointments();

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar/Header Navigation Simulation */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
              <LayoutDashboard className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-xl font-headline font-bold tracking-tight text-foreground">
              CrediCitas<span className="text-primary">Pro</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer border-b-2 border-primary pb-1">
              <CalendarDays className="w-4 h-4" /> Panel de Control
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-foreground">Asesor Premium</span>
              <span className="text-[10px] text-accent uppercase tracking-tighter">Verificado</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent border-2 border-background shadow-lg" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Bar con Info Real */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Citas Hoy', value: stats.todayCount.toString(), icon: CalendarDays, color: 'text-primary' },
            { label: 'Total Prospectos', value: stats.totalProspects.toString(), icon: Users, color: 'text-accent' },
            { label: 'Ventas Cerradas', value: stats.salesCount.toString(), icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Citas Pendientes', value: stats.pendingCount.toString(), icon: Wallet, color: 'text-primary' },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/40 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-full bg-muted/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{stat.label}</p>
                  <p className="text-xl font-headline font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Section 1: Calculator */}
          <section className="xl:col-span-5">
            <div className="sticky top-24">
              <CreditCalculator />
              
              <div className="mt-6 p-6 rounded-xl border border-primary/20 bg-primary/5">
                <h3 className="text-sm font-headline font-bold mb-2 flex items-center gap-2 text-primary">
                   💡 Nota de Calificación
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Usa el "Ingreso Mensual Recomendado" para filtrar prospectos rápidamente. Si su ingreso es menor al calculado, es probable que necesiten un aval o un enganche mayor para calificar.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: CRM/Appointments Dashboard */}
          <section className="xl:col-span-7 space-y-8">
            <AppointmentsDashboard />
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-border/40 py-8 bg-card/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
          <p>© 2024 CrediCitas Pro - Gestión de Crédito Hipotecario</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-primary transition-colors cursor-pointer">Panel</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Soporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
