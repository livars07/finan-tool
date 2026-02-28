/**
 * @fileOverview Servicio de Directorio de Números - Finanto
 * Gestiona prospectos rápidos (Marketplace) antes de ser citas.
 */

import { v4 as uuidv4 } from 'uuid';

export interface DirectoryEntry {
  id: string;
  phone: string;
  name?: string;
  createdAt: string;
  isProcessed: boolean;
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
