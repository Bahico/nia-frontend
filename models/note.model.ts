import { User } from "@/contexts/auth-context";
import { File } from "./file.model";
import { Folder } from "./folder.model";

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

export interface NoteDiarizationSegment {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}

export interface NoteDiarization {
  segments: NoteDiarizationSegment[];
}

export interface NoteOutcomePackTemplate {
  id: number;
  name: string;
  type: string; // e.g., 'TEXT'
  content: string;
  outline: string;
  description: string;
  isPublic: boolean;
  category: string; // e.g., 'PERSONAL'
  usageCount: number;
  user: User;
}

export interface NoteOutcomePack {
  id: number;
  title: string;
  location: string;
  clientName: string;
  content: Content[];
  wordCount: number;
  createdDate: string; // ISO date string
  template: NoteOutcomePackTemplate;
}

export interface Content {
  type: "TEXT" | "TASKS" | "ACTION_ITEMS";
  title: string;
  items?: string[];
  content?: { action: string, isDone: boolean }[] | string;
}

export interface NoteDetail {
  id: number;
  title: string;
  content: string;
  diarization: NoteDiarization;
  summary: string;
  isArchived: boolean;
  isPinned: boolean;
  isUpload: boolean;
  viewCount: number;
  lastViewedAt: string; // ISO date string
  wordCount: number;
  readingTimeMinutes: number;
  file: File;
  outcomePacks: NoteOutcomePack[]; // summarised content from the note
}