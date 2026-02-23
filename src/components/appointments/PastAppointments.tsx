"use client"

import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/services/appointment-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MessageSquare, 
  ChevronDown, 
  Phone, 
  Box, 
  FileText, 
  ChevronRight 
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointments: Appointment[];
  onSelect: (app: Appointment) => void;
  formatDate: (date: string) => string;
  format12hTime: (time: string) => string;
  highlightedId?: string | null;
  expanded?: boolean;
}

export default function PastAppointments({ 
  appointments, 
  onSelect, 
  formatDate, 
  format12hTime, 
  highlightedId,
  expanded = false
}: Props) {
  const [visibleCount, setVisibleCount] = useState(15);
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

  const copyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone).then(() => {
      toast({
        title: "Número copiado",
        description: `${phone} se ha copiado al portapapeles.`,
      });
    });
  };

  const visibleAppointments = appointments.slice(0, visibleCount);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className={cn(
        "border rounded-xl overflow-hidden bg-card/10 relative backdrop-blur-sm flex-1 flex flex-col",
        !expanded ? "h-[400px]" : "h-full"
      )}>
        <ScrollArea className="flex-1 scrollbar-thin">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className={expanded ? "w-[250px]" : ""}>Nombre / Teléfono</TableHead>
                {expanded && <TableHead>Contacto</TableHead>}
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
                const isHighlighted = highlightedId === app.id;
                return (
                  <TableRow 
                    key={app.id} 
                    onClick={() => onSelect(app)}
                    className={cn(
                      "hover:bg-primary/10 transition-colors cursor-pointer relative h-16",
                      isHighlighted && "bg-accent/20 animate-pulse border-2 border-accent/40 z-20"
                    )}
                  >
                    <TableCell className="align-middle">
                      <div className="font-bold text-sm text-foreground">{app.name}</div>
                      {!expanded && (
                        <div 
                          onClick={(e) => copyPhone(e, app.phone)}
                          className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-2.5 h-2.5" /> {app.phone}
                        </div>
                      )}
                    </TableCell>

                    {expanded && (
                      <TableCell className="align-middle">
                        <div 
                          onClick={(e) => copyPhone(e, app.phone)}
                          className="flex items-center gap-2 text-xs font-medium hover:text-primary transition-colors cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          {app.phone}
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
                      <div className={cn(
                        "text-[9px] uppercase font-bold px-2 py-1 rounded-full border w-fit text-center min-w-[80px]",
                        getStatusColor(app.status)
                      )}>
                        {app.status || 'N/A'}
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
            onClick={() => setVisibleCount(p => p + 15)}
            className="text-xs font-bold uppercase tracking-widest border-dashed hover:bg-primary/10 backdrop-blur-md h-9 px-6"
          >
            <ChevronDown className="mr-2 h-4 w-4" /> Cargar más historial
          </Button>
        </div>
      )}
    </div>
  );
}