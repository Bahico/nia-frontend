import { API_BASE_URL } from "@/constants/api-url";
import { getAuthHeaders } from "@/utils/api-client";

export async function sendRecordedFile(fileUri: string): Promise<void> {
    const authHeaders = await getAuthHeaders(true);
    const formData = new FormData();

    // 2. Create the File Object
    // We use 'as any' because the standard TypeScript FormData type
    // expects a Web Blob, but React Native expects this specific object.
        
    // 3. Append to form data
    formData.append('audioFile', {
        uri: fileUri,
        name: `recording-${Date.now()}.m4a`,
        type: 'audio/m4a', // Use x-m4a or audio/m4a
    } as any);
    formData.append('transcriptModel', 'GROQ');

    try {
        const response = await fetch(`${API_BASE_URL}/transcript`, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
              ...authHeaders,
            },
          });
        return await response.json();
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}