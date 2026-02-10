import { Note } from '@/models/note.model';
import { apiGet, apiPut } from '@/utils/api-client';

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

/**
 * Update a note by id from backend api/notes/:id
 */
export async function updateNote(note: Note): Promise<Note> {
  console.log('Updating note:', note);
  return apiPut<Note>(`/notes/${note.id}`, note);
}