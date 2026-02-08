import { apiGet } from '@/utils/api-client';
import { Note } from '@/models/note.model';

/**
 * Fetch all notes from backend api/notes
 */
export async function getNotes(): Promise<Note[]> {
  return apiGet<Note[]>('/notes');
}

/**
 * Fetch a single note by id from backend api/notes/:id
 */
export async function getNote(id: number): Promise<Note> {
  return apiGet<Note>(`/notes/${id}`);
}
