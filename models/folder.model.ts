import { User } from "@/contexts/auth-context";
import { Note } from "./note.model";

export interface Folder {
    id: number;
    name: string;
    description: string;
    color: string;
    icon: string;
    isDefault: boolean;
    position: number;
    user: User;
    notes: Note[];
  }