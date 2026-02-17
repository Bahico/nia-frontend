import { Note } from '@/models/note.model';
import { apiDelete, apiGet, apiPost, apiPut } from '@/utils/api-client';

/**
 * Fetch notes from backend api/notes.
 * Optional filter: foldersId.equals=folderId to filter by folder.
 */
export async function getNotes(params?: { 'foldersId.equals'?: number }): Promise<Note[]> {
  return apiGet<Note[]>('/notes', {
    params: params && params['foldersId.equals'] != null ? params : undefined,
  });
}

/**
 * Fetch a single note by id from backend api/notes/:id
 */
export async function getNote(id: number): Promise<Note> {
  return apiGet<Note>(`/notes/${id}`);
}

/**
 * Delete a note by id from backend api/notes/:id
 */
export async function deleteNote(noteId: number): Promise<Note> {
  return apiDelete<Note>(`/notes/${noteId}`);
}

/**
 * Update a note by id from backend api/notes/:id
 */
export async function updateNote(note: Note): Promise<Note> {
  console.log('Updating note:', note);
  return apiPut<Note>(`/notes/${note.id}`, note);
}

/**
 * Update a note by id from backend api/notes/:id
 */
export async function noteMoveToFolder(noteId: number, folderId: number): Promise<Note> {
  console.log('Moving note to folder:', noteId, folderId);
  return apiPost<Note>(`/notes/move-to-folder`, { folderId: folderId, noteId: noteId });
}