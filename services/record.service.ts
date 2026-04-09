import { apiPost } from "@/utils/api-client";
import uuid from 'react-native-uuid';
import { createFile } from "./files.service";

export type SendRecordedFileOptions = {
    uri: string;
    name?: string;
    type?: string;
};

export async function sendRecordedFile(fileUriOrOptions: string | SendRecordedFileOptions, duration: number): Promise<void> {
    const isUploaded = typeof fileUriOrOptions !== 'string';

    const uri = isUploaded ? fileUriOrOptions.uri : fileUriOrOptions;

    const originalName = isUploaded ? fileUriOrOptions.name : undefined;
    const mimeType = isUploaded ? (fileUriOrOptions.type ?? 'audio/mpeg') : 'audio/m4a';

    const baseUuid = uuid.v4();

    // Derive extension
    let extension = '.m4a';
    if (originalName && originalName.includes('.')) {
        const dotIndex = originalName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < originalName.length - 1) {
            extension = originalName.slice(dotIndex);
        }
    }

    const storageFileName = isUploaded
        ? `${baseUuid}_uploaded${extension}`
        : `${baseUuid}${extension}`;

    // const authHeaders = await getAuthHeaders(true);
    // const formData = new FormData();

    console.log(storageFileName);

    const signedUrl = await getSignedUrl(storageFileName);
    console.log(signedUrl);

    if (!signedUrl) {
        throw new Error('Failed to get signed URL');
    }
    const file = await fetch(uri);
    const fileBlob = await file.blob();
    const response = await fileUploadToGCS(signedUrl.url, fileBlob);
    if (!response) {
        throw new Error('Failed to upload file to GCS');
    }

    try {
        await createFile({
            fileName: storageFileName,
            filePath: storageFileName,
            fileSize: fileBlob.size,
            duration: duration,
            mimeType: mimeType,
            isArchived: false,
            title: null,
            note: null,
            folders: []
        });

    } catch (error) {
        console.error('Failed to create file:', error);
        throw error;
    }
}

export async function reTranscribe(data: { noteId: number }) {

}

export async function getSignedUrl(fileName: string) {
    return apiPost<{ url: string }>(`/google-cloud-storage/signed-url`, { filename: fileName });
}

export async function fileUploadToGCS(signedUrl: string, file: Blob) {
    try {
        const response = await fetch(signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });
        return response.ok;
    } catch (error) {
        console.error('File upload to GCS failed:', error);
        throw error;
    }
}