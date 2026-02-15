import { Note, NoteUser } from "./note.model";

export interface Folder {
    id: number;
    name: string;
    description: string;
    color: string;
    icon: string;
    isDefault: boolean;
    position: number;
    user: NoteUser;
    notes: Note[];
  }