/**
 * Note model — matches backend API api/notes response.
 */

export interface NoteUser {
  id: number;
  login: string;
}

export interface NoteFolder {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  isDefault: boolean;
  position: number;
  user: NoteUser;
  notes: string[];
}

export interface Note {
  id: number;
  title: string;
  content: string;
  diarizationContent: string;
  summary: string;
  isArchived: boolean;
  isPinned: boolean;
  isUpload: boolean;
  viewCount: number;
  lastViewedAt: string; // ISO date string
  wordCount: number;
  readingTimeMinutes: number;
  folders: NoteFolder[];
}
