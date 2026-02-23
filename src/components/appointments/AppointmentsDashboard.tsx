
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import AppointmentForm from './AppointmentForm';
import UpcomingAppointments from './UpcomingAppointments';
import PastAppointments from './PastAppointments';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  CalendarClock, 
  Search, 
  Maximize2, 
  X, 
  LayoutDashboard,
  Target,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  Coins,
  ArrowRight,
  Info
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import * as Service from '@/services/appointment-service';

interface AppointmentsDashboardProps {
  appointments: Appointment[];
  upcoming: Appointment[];
  past: Appointment[];
  addAppointment: (newApp: Omit<Appointment, 'id'>) => void;
  updateStatus: (id: string, status: AppointmentStatus, notes?: string) => void;
  editAppointment: (id: string, updatedData: Partial<Appointment>) => void;
  toggleConfirmation: (id: string) => void;
  formatFriendlyDate: (date: string) => string;
  format12hTime: (time: string) => string;
}

export default function AppointmentsDashboard({
  appointments,
  upcoming,
  past,
  addAppointment,
  updateStatus,
  editAppointment,
  toggleConfirmation,
  formatFriendlyDate,
  format12hTime
}: AppointmentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const stats = useMemo(() => Service.calculateStats(appointments), [appointments]);

  useEffect(() => {
    if (isExpanded) {
      const originalTitle = document.title;
      document.title = "Gestión de Citas";
      window.history.pushState(null, '', '/gestor');
      return () => { 
        document.title = originalTitle; 
        if (window.location.pathname === '/gestor') {
          window.history.pushState(null, '', '/');
        }
      };
    }
  }, [isExpanded]);

  const normalizeStr = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const filterAppointments = (list: Appointment[]) => {
    if (!searchTerm) return list;
    const s = normalizeStr(searchTerm);
    
    return list.filter(app => {
      const appDate = parseISO(app.date);
      const friendlyDate = normalizeStr(formatFriendlyDate(app.date));
      const monthName = normalizeStr(format(appDate, 'MMMM', { locale: es }));
      const dayName = normalizeStr(format(appDate, 'EEEE', { locale: es }));
      
      const basicMatch = 
        normalizeStr(app.name).includes(s) || 
        app.phone.includes(s) || 
        (app.status && normalizeStr(app.status).includes(s)) ||
        (app.product && normalizeStr(app.product).includes(s));
      
      if (basicMatch) return true;
      if (friendlyDate.includes(s)) return true;
      if (monthName.includes(s)) return true;
      if (dayName.includes(s)) return true;

      return false;
    });
  };

  const filteredUpcoming = useMemo(() => filterAppointments(upcoming), [upcoming, searchTerm]);
  const filteredPast = useMemo(() => filterAppointments(past), [past, searchTerm]);

  const selectedApp = useMemo(() => {
    return appointments.find(app => app.id === selectedAppId) || null;
  }, [appointments, selectedAppId]);

  const handleOpenChange = (open: boolean) => {
    if (!open && selectedAppId) {
      setHighlightedId(selectedAppId);
      setTimeout(() => setHighlightedId(null), 4000);
    }
    if (!open) setSelectedAppId(null);
  };

  const DashboardContent = ({ expanded = false }: { expanded?: boolean }) => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0", expanded && "bg-muted/10 p-6 rounded-2xl border border-border/30 backdrop-blur-md")}>
        <TabsList className={cn(
          "grid w-full sm:w-80 grid-cols-2 p-1.5 bg-muted/50 border border-border/20 shadow-inner",
          "data-[state=active]:bg-background"
        )}>
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            Próximas ({filteredUpcoming.length})
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            Historial ({filteredPast.length})
          </TabsTrigger>
        </TabsList>

        {expanded && (
          <TooltipProvider delayDuration={0}>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-6 items-center flex-1 ml-0 sm:ml-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center sm:items-start group cursor-help">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">Hoy</span>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20"><CalendarDays className="w-3.5 h-3.5"/></div>
                      <span className="text-sm font-bold text-foreground">{stats.todayConfirmed}<span className="text-muted-foreground/40 mx-0.5">/</span>{stats.todayCount}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Citas confirmadas vs. citas totales para el día de hoy.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center sm:items-start group cursor-help">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1 group-hover:text-accent transition-colors">Mañana</span>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20"><ArrowRight className="w-3.5 h-3.5"/></div>
                      <span className="text-sm font-bold text-foreground">{stats.tomorrowTotal}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Volumen de citas programadas para el día de mañana.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center sm:items-start group cursor-help">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1 group-hover:text-green-500 transition-colors">Cierres Mes</span>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20"><CheckCircle2 className="w-3.5 h-3.5"/></div>
                      <span className="text-sm font-bold text-foreground">{stats.currentMonthSales}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Número de trámites concretados con éxito en el mes actual.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:flex flex-col items-center sm:items-start group cursor-help">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Apartados</span>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20"><Coins className="w-3.5 h-3.5"/></div>
                      <span className="text-sm font-bold text-foreground">{stats.currentMonthApartados}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Clientes que han realizado un apartado en el mes actual.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:flex flex-col items-center sm:items-start group cursor-help">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">Conversión</span>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20"><TrendingUp className="w-3.5 h-3.5"/></div>
                      <span className="text-sm font-bold text-foreground">{stats.conversionRate}%</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Ratio de efectividad basado en cierres vs. prospectos totales.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <TabsContent value="upcoming" className="mt-0 h-full">
          <UpcomingAppointments 
            appointments={filteredUpcoming} 
            allAppointments={appointments}
            formatDate={formatFriendlyDate}
            format12hTime={format12hTime}
            onSelect={(app) => setSelectedAppId(app.id)}
            updateStatus={updateStatus}
            toggleConfirmation={toggleConfirmation}
            highlightedId={highlightedId}
            expanded={expanded}
          />
        </TabsContent>
        <TabsContent value="past" className="mt-0 h-full">
          <PastAppointments 
            appointments={filteredPast} 
            formatDate={formatFriendlyDate}
            format12hTime={format12hTime}
            onSelect={(app) => setSelectedAppId(app.id)}
            highlightedId={highlightedId}
            expanded={expanded}
          />
        </TabsContent>
      </div>
    </Tabs>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <AppointmentForm onAdd={addAppointment} />

        <Card className="shadow-xl bg-card border-border border-l-4 border-l-blue-600 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-600/20">
                <CalendarClock className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-headline font-semibold">Gestión de citas</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">Monitoreo de prospectos y cierres</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar prospecto..."
                  className="pl-9 h-9 bg-muted/30 border-border/50 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsExpanded(true)}
                className="h-9 w-9 rounded-lg text-muted-foreground/60 hover:text-blue-600 hover:bg-blue-600/10 transition-all border border-transparent hover:border-blue-600/20"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <DashboardContent />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent 
          className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none shadow-none p-0 flex flex-col overflow-hidden z-[60]"
        >
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-600/30">
                <LayoutDashboard className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Panel de Control de Citas</DialogTitle>
                <DialogDescription className="text-xs">Vista completa del flujo de prospectos y operaciones mensuales.</DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative w-80 hidden md:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Búsqueda global..."
                  className="pl-9 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-10 w-10">
                  <X className="w-5 h-5" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <DashboardContent expanded={true} />
          </div>
        </DialogContent>
      </Dialog>

      <AppointmentDetailsDialog 
        appointment={selectedApp} 
        open={!!selectedAppId} 
        onOpenChange={handleOpenChange}
        onEdit={editAppointment}
        formatFriendlyDate={formatFriendlyDate}
        format12hTime={format12hTime}
      />
    </div>
  );
}
