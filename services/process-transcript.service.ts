import { Template } from '@/models/template';
import { apiPost } from '@/utils/api-client';

export interface ProcessTranscriptRequest {
  noteId: number;
  templateId: number;
  templateType: string;
  type: 'SUMMARY';
}

export interface ProcessTranscriptResponse {
    id: number;
    content: string;
    wordCount: number;
    template: Template;
}

/**
 * Fetch all templates from backend api/templates
 */
export async function processTranscript(data: ProcessTranscriptRequest): Promise<ProcessTranscriptResponse> {
  return apiPost<ProcessTranscriptResponse>('/process-transcript', data);
}