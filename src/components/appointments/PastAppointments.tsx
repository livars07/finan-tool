
"use client"

import React from 'react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MessageSquare, 
  ChevronDown, 
  Phone, 
  Box, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  UserCog
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  appointments: Appointment[];
  onSelect: (app: Appointment) => void;
  onHighlight: (app: Appointment) => void;
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  activeId?: string | null;
  expanded?: boolean;
  visibleCount: number;
  setVisibleCount: (count: number | ((prev: number) => number)) => void;
}

export default function PastAppointments({ 
  appointments, 
  onSelect, 
  onHighlight,
  formatDate, 
  format12hTime, 
  activeId, 
  expanded = false,
  visibleCount,
  setVisibleCount
}: Props) {
  const { toast } = useToast();

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 h-full rounded-xl border border-dashed border-border/50">
        <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay registro de citas pasadas</p>
      </div>
    );
  }

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status) {
      case 'Cierre': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Apartado': return 'text-green-100/90 bg-green-500/20 border-green-400/30';
      case 'No asistencia': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'Reagendó': return 'text-primary bg-primary/10 border-primary/20';
      case 'Asistencia': return 'text-accent bg-accent/10 border-accent/20';
      case 'Reembolso': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Continuación en otra cita': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-muted-foreground bg-muted/10 border-border/20';
    }
  };

  const copyPhone = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    onHighlight(app);
    navigator.clipboard.writeText(app.phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${app.name}: ${app.phone} listo para usar.`,
      });
    });
  };

  const visibleAppointments = appointments.slice(0, visibleCount);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className={cn(
        "border rounded-xl overflow-hidden relative backdrop-blur-sm bg-card/10 flex flex-col",
        !expanded ? "h-[400px]" : "h-full flex-1"
      )}>
        <ScrollArea className="flex-1 scrollbar-thin">
          <Table>
            <TableHeader className="bg-card sticky top-0 z-30 shadow-sm border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className={expanded ? "w-[180px]" : ""}>Nombre / Teléfono</TableHead>
                {expanded && <TableHead className="w-[140px]">Contacto</TableHead>}
                <TableHead>Motivo</TableHead>
                {expanded && <TableHead>Producto</TableHead>}
                <TableHead>Fecha / Hora</TableHead>
                {expanded && <TableHead className="w-[300px]">Notas rápidas</TableHead>}
                <TableHead>Resultado</TableHead>
                {expanded && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAppointments.map((app) => {
                const isSelected = activeId === app.id;
                const isCierre = app.status === 'Cierre' || app.status === 'Apartado';
                const isCommissionPending = isCierre && app.commissionStatus !== 'Pagada';

                return (
                  <TableRow 
                    key={app.id} 
                    onClick={() => onSelect(app)}
                    className={cn(
                      "hover:bg-primary/10 transition-colors cursor-pointer relative h-16",
                      isSelected && "bg-primary/20 border-l-4 border-l-primary z-20"
                    )}
                  >
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm text-foreground">{app.name}</div>
                        {app.prospectorName && (
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <div className="p-1 rounded-full bg-primary/10 text-primary cursor-help">
                                  <UserCog className="h-3 w-3" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-[10px] font-bold uppercase">Prospectado por: {app.prospectorName}</p>
                                {app.prospectorPhone && <p className="text-[9px] text-muted-foreground">{app.prospectorPhone}</p>}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {!expanded && (
                        <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" /> 
                          <span 
                            onClick={(e) => copyPhone(e, app)} 
                            className="hover:text-primary transition-colors cursor-pointer font-medium"
                          >
                            {app.phone}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {expanded && (
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span 
                            onClick={(e) => copyPhone(e, app)} 
                            className="hover:text-primary transition-colors cursor-pointer font-bold"
                          >
                            {app.phone}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="text-[10px] text-muted-foreground uppercase font-bold align-middle">
                      {app.type}
                    </TableCell>

                    {expanded && (
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <Box className="w-3.5 h-3.5 text-accent" /> {app.product || 'N/A'}
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="text-muted-foreground text-[10px] uppercase font-bold align-middle">
                      <div className="leading-tight">{formatDate(app.date)}</div>
                      <div className="text-accent/80">{format12hTime(app.time)}</div>
                    </TableCell>

                    {expanded && (
                      <TableCell className="align-middle">
                        <div className="flex items-start gap-2 max-w-[280px]">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {app.notes || 'Sin anotaciones registradas.'}
                          </p>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="align-middle">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "text-[9px] uppercase font-bold px-2 py-1 rounded-full border w-fit text-center min-w-[80px]",
                          getStatusColor(app.status)
                        )}>
                          {app.status || 'N/A'}
                        </div>
                        {isCommissionPending && (
                          <div title="Pago Pendiente">
                            <ShieldAlert className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {expanded && (
                      <TableCell className="align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => onSelect(app)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {visibleCount < appointments.length && (
        <div className="flex justify-center shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setVisibleCount(p => p + 25)}
            className="text-xs font-bold uppercase tracking-widest border-dashed hover:bg-primary/10 backdrop-blur-md h-9 px-6"
          >
            <ChevronDown className="mr-2 h-4 w-4" /> Cargar más historial
          </Button>
        </div>
      )}
    </div>
  );
}
