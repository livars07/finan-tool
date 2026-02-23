"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from '@/hooks/use-appointments';
import { generateFollowUpMessage } from '@/ai/flows/generate-follow-up-message';
import { Copy, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FollowUpDialog({ appointment, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && appointment) {
      handleGenerate();
    } else {
      setMessage('');
    }
  }, [open, appointment]);

  const handleGenerate = async () => {
    if (!appointment) return;
    setLoading(true);
    try {
      const res = await generateFollowUpMessage({
        status: appointment.status || 'Cita Exitosa',
        clientName: appointment.name,
        agentName: 'Ejecutivo Finanto',
      });
      setMessage(res.messageTemplate);
    } catch (err) {
      toast({
        title: "Error de IA",
        description: "No se pudo generar el mensaje en este momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copiado",
      description: "Mensaje copiado al portapapeles.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-accent w-5 h-5" />
            Asistente de Seguimiento IA
          </DialogTitle>
          <DialogDescription>
            Mensaje sugerido para <strong>{appointment?.name}</strong> (Estado: {appointment?.status || 'N/A'})
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50 relative">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <div className="flex justify-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            </div>
          ) : message ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {message}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">Sin mensaje generado.</p>
          )}
        </div>

        <DialogFooter className="mt-6 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button
            onClick={copyToClipboard}
            disabled={!message || loading}
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <Copy className="mr-2 h-4 w-4" /> Copiar Mensaje
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
