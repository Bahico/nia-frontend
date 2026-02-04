import { API_BASE_URL } from "@/constants/api-url";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export async function sendRecordedFile(fileUri: string): Promise<void> {
    try {
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
        console.log(formData.get('audioFile'));

        try {
            const AUTH_TOKEN_KEY = '@auth_token';
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            const response = await axios.post(`${API_BASE_URL}/transcript`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            })


            // const result = await response;
            console.log('Server response:', response);
        } catch (error) {
            console.error('Upload error:', error);
        }
    } catch (error) {
        console.error('Upload failed', error);
    }
}