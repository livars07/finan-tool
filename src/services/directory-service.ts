/**
 * @fileOverview Servicio de Directorio de Números - Finanto
 * Gestiona prospectos rápidos (Marketplace) antes de ser citas.
 */

import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';

export interface DirectoryEntry {
  id: string;
  phone: string;
  name?: string;
  createdAt: string;
  isProcessed: boolean;
  messageSent?: boolean;
}

export const DIRECTORY_STORAGE_KEY = 'FINANTO_DIRECTORY_V1';

export const saveDirectoryToDisk = (entries: DirectoryEntry[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(entries));
};

export const getDirectoryFromDisk = (): DirectoryEntry[] => {
  if (typeof window === 'undefined') return [];
  const rawData = localStorage.getItem(DIRECTORY_STORAGE_KEY);
  if (!rawData) return [];
  try {
    return JSON.parse(rawData) as DirectoryEntry[];
  } catch (e) {
    return [];
  }
};

/**
 * Genera prospectos seed para el directorio.
 */
export const generateDirectorySeeds = (): DirectoryEntry[] => {
  const names = ['Pedro Mercado', 'Lucia Marketplace', 'Inversionista FB', 'Interesado Depa', 'Roberto Casas'];
  const phones = ['6641234567', '6649876543', '6645551212', '6640001122', '6648887766'];
  
  const entries: DirectoryEntry[] = names.map((name, i) => ({
    id: uuidv4(),
    phone: phones[i],
    name: name,
    createdAt: subDays(new Date(), i).toISOString(),
    isProcessed: i % 2 === 0,
    messageSent: i === 0
  }));

  saveDirectoryToDisk(entries);
  return entries;
};
