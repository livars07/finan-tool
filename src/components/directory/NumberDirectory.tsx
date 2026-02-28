"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  UserPlus, 
  Plus, 
  Search, 
  Maximize2, 
  X, 
  Copy, 
  CalendarPlus, 
  Trash2,
  ListTodo,
  Hash,
  ArrowRight,
  MessageSquare,
  Check
} from 'lucide-react';
import { useDirectory } from '@/hooks/use-directory';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

interface NumberDirectoryProps {
  initialExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onConvertToAppointment: (phone: string, name?: string) => void;
}

interface DirectoryContentProps {
  expanded?: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  newName: string;
  setNewName: (s: string) => void;
  newPhone: string;
  setNewPhone: (s: string) => void;
  handleAdd: (e: React.FormEvent) => void;
  filteredEntries: any[];
  toggleProcessed: (id: string) => void;
  toggleMessageSent: (id: string) => void;
  removeEntry: (id: string) => void;
  copyPhone: (phone: string) => void;
  onConvertToAppointment: (phone: string, name?: string) => void;
  clearDirectory: () => void;
  totalEntries: number;
}

const DirectoryContent = ({ 
  expanded = false,
  searchTerm,
  setSearchTerm,
  newName,
  setNewName,
  newPhone,
  setNewPhone,
  handleAdd,
  filteredEntries,
  toggleProcessed,
  toggleMessageSent,
  removeEntry,
  copyPhone,
  onConvertToAppointment,
  clearDirectory,
  totalEntries
}: DirectoryContentProps) => (
  <div className="flex flex-col h-full gap-4">
    <form onSubmit={handleAdd} className="flex flex-wrap gap-3 p-4 bg-muted/20 border border-border/40 rounded-xl shrink-0">
      <div className="flex-1 min-w-[150px]">
        <Input 
          placeholder="Nombre (Opcional)" 
          value={newName} 
          onChange={e => setNewName(e.target.value)}
          className="h-10 bg-background"
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <Input 
          placeholder="Número telefónico" 
          value={newPhone} 
          onChange={e => setNewPhone(e.target.value)}
          className="h-10 bg-background"
        />
      </div>
      <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold h-10 px-6 gap-2">
        <Plus className="w-4 h-4" /> Registrar
      </Button>
    </form>

    <div className="relative shrink-0">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Filtrar por nombre o número..." 
        className="pl-9 h-9 bg-muted/10" 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
    </div>

    <div className={cn("border rounded-xl overflow-hidden flex-1 flex flex-col bg-card/20", expanded ? "" : "max-h-[350px]")}>
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="divide-y divide-border/20">
          {filteredEntries.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground italic flex flex-col items-center gap-2">
              <Hash className="w-8 h-8 opacity-20" />
              <p className="text-xs uppercase font-bold tracking-widest opacity-40">Directorio vacío</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div 
                key={entry.id} 
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-muted/30 transition-all group",
                  entry.isProcessed && "opacity-60"
                )}
              >
                <Checkbox 
                  checked={entry.isProcessed} 
                  onCheckedChange={() => toggleProcessed(entry.id)}
                  className="h-5 w-5 rounded-md border-primary/50 data-[state=checked]:bg-primary"
                />
                
                <div className="flex-1 min-w-0" onClick={() => copyPhone(entry.phone)}>
                  <div className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    entry.isProcessed && "line-through text-muted-foreground"
                  )}>
                    <span className="font-bold text-sm truncate">{entry.name || 'Sin nombre'}</span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter shrink-0">
                      {format(parseISO(entry.createdAt), 'd MMM', { locale: es })}
                    </span>
                  </div>
                  <div className={cn(
                    "text-xs font-mono font-bold text-primary flex items-center gap-2 mt-0.5 cursor-pointer hover:underline",
                    entry.isProcessed && "line-through text-muted-foreground"
                  )}>
                    <Phone className="w-3 h-3" /> {entry.phone}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); toggleMessageSent(entry.id); }}
                    className={cn(
                      "h-8 text-[10px] font-bold uppercase gap-2 border-border/50 transition-all",
                      entry.messageSent ? "bg-green-500/10 text-green-600 border-green-500/20" : "hover:bg-muted"
                    )}
                  >
                    {entry.messageSent ? <Check className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    {entry.messageSent ? "Mensaje Enviado" : "Mensaje"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                    className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={(e) => { e.stopPropagation(); onConvertToAppointment(entry.phone, entry.name); }}
                    className="h-8 text-[10px] font-bold uppercase gap-2 border border-border/50"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Convertir
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>

    {totalEntries > 0 && (
      <div className="flex justify-end pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearDirectory}
          className="text-[9px] font-bold uppercase text-muted-foreground hover:text-destructive"
        >
          Limpiar Directorio
        </Button>
      </div>
    )}
  </div>
);

export default function NumberDirectory({ 
  initialExpanded = false, 
  onExpandedChange,
  onConvertToAppointment 
}: NumberDirectoryProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const { entries, addEntry, toggleProcessed, toggleMessageSent, removeEntry, clearDirectory, isLoaded } = useDirectory();
  const { toast } = useToast();

  React.useEffect(() => {
    onExpandedChange?.(isExpanded);
    if (isExpanded) {
      window.history.pushState(null, '', '/directorio');
    } else if (window.location.pathname === '/directorio') {
      window.history.pushState(null, '', '/');
    }
  }, [isExpanded, onExpandedChange]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone) {
      toast({ title: "Error", description: "El número es obligatorio.", variant: "destructive" });
      return;
    }
    addEntry(newPhone, newName);
    setNewName('');
    setNewPhone('');
    toast({ title: "Número Guardado", description: "Prospecto añadido al directorio." });
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone).then(() => {
      toast({ title: "Copiado", description: "Número listo para marcar." });
    });
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.phone.includes(searchTerm) || 
      (e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [entries, searchTerm]);

  return (
    <>
      <Card className="shadow-xl bg-card border-border border-l-4 border-l-accent overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-xl border border-accent/20">
              <ListTodo className="text-accent w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-headline font-semibold">Directorio de números</CardTitle>
              <CardDescription className="text-muted-foreground">Prospectos Marketplace rápidos</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(true)}
            className="h-9 w-9 text-muted-foreground/60 hover:text-accent hover:bg-accent/10"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <DirectoryContent 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            newName={newName}
            setNewName={setNewName}
            newPhone={newPhone}
            setNewPhone={setNewPhone}
            handleAdd={handleAdd}
            filteredEntries={filteredEntries}
            toggleProcessed={toggleProcessed}
            toggleMessageSent={toggleMessageSent}
            removeEntry={removeEntry}
            copyPhone={copyPhone}
            onConvertToAppointment={onConvertToAppointment}
            clearDirectory={clearDirectory}
            totalEntries={entries.length}
          />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent 
          data-calculator-dialog="true"
          className="max-w-none w-screen h-screen m-0 rounded-none bg-background border-none shadow-none p-0 flex flex-col overflow-hidden z-[60]"
        >
          <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-2 rounded-xl border border-accent/30">
                <ListTodo className="text-accent w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground">Directorio Profesional de Prospectos</DialogTitle>
                <DialogDescription className="text-xs">Convierta números de Marketplace en llamadas y citas efectivas.</DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors h-10 w-10">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="flex-1 p-8 overflow-hidden bg-muted/5">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <DirectoryContent 
                expanded={true} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                newName={newName}
                setNewName={setNewName}
                newPhone={newPhone}
                setNewPhone={setNewPhone}
                handleAdd={handleAdd}
                filteredEntries={filteredEntries}
                toggleProcessed={toggleProcessed}
                toggleMessageSent={toggleMessageSent}
                removeEntry={removeEntry}
                copyPhone={copyPhone}
                onConvertToAppointment={onConvertToAppointment}
                clearDirectory={clearDirectory}
                totalEntries={entries.length}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
