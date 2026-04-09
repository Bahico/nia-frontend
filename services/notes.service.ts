import { Note, NoteDetail } from '@/models/note.model';
import { apiDelete, apiGet, apiPatch } from '@/utils/api-client';

/**
 * Fetch notes from backend api/notes/for-mobile.
 * Optional filter: foldersId.equals=folderId to filter by folder.
 */
export async function getNotes(params?: { 'foldersId.equals'?: number }): Promise<Note[]> {
  return apiGet<Note[]>('/notes/for-mobile', {
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
  return apiPatch<Note>(`/notes/${note.id}`, note);
}

/**
 * Get a note detail by filePath or id from backend api/notes/detail/:filePathOrId
 */
export async function getNoteDetail(filePathOrId: string | number): Promise<NoteDetail> {
  return apiGet<NoteDetail>(`/notes/detail/${filePathOrId}`);
}