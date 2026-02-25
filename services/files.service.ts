import { File } from "@/models/file.model";
import { apiGet, apiPatch, apiPost } from "@/utils/api-client";

export async function getFiles(): Promise<File[]> {
    return apiGet<File[]>('/files');
}

export async function getFile(id: number): Promise<File> {
    return apiGet<File>(`/files/${id}`);
}

export async function createFile(file: Omit<File, 'id' | 'user' >): Promise<File> {
    return apiPost<File>('/files', file);
}

export async function updateFile(id: number, file: File): Promise<File> {
    return apiPatch<File>(`/files/${id}`, file);
}