import { User } from "@/contexts/auth-context";
import { Folder } from "./folder.model";
import { Note } from "./note.model";

export interface File {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  duration: number;
  mimeType: string;
  title: string;
  isArchived: boolean;
  createdDate?: string | Date;
  user: User;
  note: Note | null;
  folders: Folder[];
}