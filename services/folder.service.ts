import { Folder } from "@/models/folder.model";
import { apiDelete, apiGet, apiPost, apiPut } from "@/utils/api-client";

/**
 * Fetch all folders from backend api/folders
 */
export async function getFolders(): Promise<Folder[]> {
  return apiGet<Folder[]>('/folders');
}

/**
 * Create a new folder
 */
export async function createFolder(folder: Partial<Folder>): Promise<Folder> {
  return apiPost<Folder>('/folders', folder);
}

/**
 * Update a folder
 */
export async function updateFolder(folder: Folder): Promise<Folder> {
  return apiPut<Folder>(`/folders/${folder.id}`, folder);
}

/**
 * Delete a folder
 */
export async function deleteFolder(id: number): Promise<void> {
  return apiDelete<void>(`/folders/${id}`);
}