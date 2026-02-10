import { Template } from '@/models/template';
import { apiGet } from '@/utils/api-client';

/**
 * Fetch all templates from backend api/templates
 */
export async function getTemplates(): Promise<Template[]> {
  return apiGet<Template[]>('/templates');
}

/**
 * Fetch a single template by id from backend api/templates/:id
 */
export async function getTemplate(id: number): Promise<Template> {
  return apiGet<Template>(`/templates/${id}`);
}
