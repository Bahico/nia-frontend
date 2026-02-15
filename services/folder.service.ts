import { Folder } from "@/models/folder.model";
import { apiGet } from "@/utils/api-client";

/**
 * Fetch all folders from backend api/folders
 */
export async function getFolders(): Promise<Folder[]> {
    return apiGet<Folder[]>('/folders');
  }