import { apiGet, apiPost } from "@/utils/api-client";

export async function getSignedUrl(fileName: string) {
    return apiPost<{ url: string }>(`/google-cloud-storage/signed-url`, { filename: fileName });
}

export async function getFileUrl(filename: string) {
    return apiGet<{ url: string }>('/google-cloud-storage/signed-url', { params: { filename } });
}