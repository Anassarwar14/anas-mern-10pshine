"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

export interface Note {
  id: number;
  title: string;
  plainText: string;
  color: string;
  order: number
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean
  tags: Array<{ id: number; name: string }>;
  imageURLs: string[];
  createdAt: string;
  updatedAt: string;
  folderId?: number | null;
  content?: any;
}

export interface Folder {
  id: number;
  name: string;
  order: number
  notes?: Note[];
}

interface NotesContextType {
  folders: Folder[];
  setFolders: Dispatch<SetStateAction<Folder[]>>;
  quickNotes: Note[];
  setQuickNotes: Dispatch<SetStateAction<Note[]>>;
}

interface NotesProviderProps {
  initialFolders: Folder[];
  initialNotes: Note[];
  children: ReactNode;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ initialFolders, initialNotes, children }: NotesProviderProps) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [quickNotes, setQuickNotes] = useState<Note[]>(initialNotes);

  return (
    <NotesContext.Provider value={{ folders, setFolders, quickNotes, setQuickNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextType {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
