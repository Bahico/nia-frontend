import { Folder } from "./folder.model";

export interface NoteUser {
  id: number;
  login: string;
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
  folders: Folder[];
}
