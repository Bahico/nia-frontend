import { File } from "@/models/file.model";
import { apiGet, apiPatch, apiPost } from "@/utils/api-client";

/**
 * Get all files from backend api/files
 */
export async function getFiles(params: any): Promise<File[]> {
    return apiGet<File[]>('/files', { params });
}

/**
 * Get a file by id from backend api/files/:id
 */
export async function getFile(id: number): Promise<File> {
    return apiGet<File>(`/files/${id}`);
}

/**
 * Create a file from backend api/files
 */
export async function createFile(file: Omit<File, 'id' | 'user' >): Promise<File> {
    return apiPost<File>('/files', file);
}

/**
 * Update a file by id from backend api/files/:id
 */
export async function updateFile(file: File): Promise<File> {
    return apiPatch<File>(`/files/${file.id}`, file);
}

/**
 * Update a file by id from backend api/files/:id
 */
export async function fileMoveToFolder(fileId: number, folderId: number): Promise<File> {
    console.log('Moving file to folder:', fileId, folderId);
    return apiPost<File>(`/files/move-to-folder`, { folderId: folderId, fileId: fileId });
  }