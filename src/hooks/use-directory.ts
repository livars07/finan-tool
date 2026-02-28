"use client"

import { useState, useEffect } from 'react';
import * as Service from '@/services/directory-service';
import { v4 as uuidv4 } from 'uuid';

export function useDirectory() {
  const [entries, setEntries] = useState<Service.DirectoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const data = Service.getDirectoryFromDisk();
    if (data.length === 0 && !localStorage.getItem('FINANTO_DIRECTORY_SEEDED')) {
      const seeds = Service.generateDirectorySeeds();
      setEntries(seeds);
      localStorage.setItem('FINANTO_DIRECTORY_SEEDED', 'true');
    } else {
      setEntries(data);
    }
    setIsLoaded(true);
  }, []);

  const addEntry = (phone: string, name?: string) => {
    const newEntry: Service.DirectoryEntry = {
      id: uuidv4(),
      phone,
      name,
      createdAt: new Date().toISOString(),
      isProcessed: false,
      messageSent: false
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    Service.saveDirectoryToDisk(updated);
  };

  const toggleProcessed = (id: string) => {
    const updated = entries.map(e => 
      e.id === id ? { ...e, isProcessed: !e.isProcessed } : e
    );
    setEntries(updated);
    Service.saveDirectoryToDisk(updated);
  };

  const toggleMessageSent = (id: string) => {
    const updated = entries.map(e => 
      e.id === id ? { ...e, messageSent: !e.messageSent } : e
    );
    setEntries(updated);
    Service.saveDirectoryToDisk(updated);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    Service.saveDirectoryToDisk(updated);
  };

  const clearDirectory = () => {
    setEntries([]);
    Service.saveDirectoryToDisk([]);
  };

  const resetDirectory = () => {
    const seeds = Service.generateDirectorySeeds();
    setEntries(seeds);
    localStorage.setItem('FINANTO_DIRECTORY_SEEDED', 'true');
  };

  return {
    entries,
    addEntry,
    toggleProcessed,
    toggleMessageSent,
    removeEntry,
    clearDirectory,
    resetDirectory,
    isLoaded
  };
}
