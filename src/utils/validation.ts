import { DEFAULT_APP_COLOR } from './constants';
import type { AppTemplate } from '../types/template';

export function validateAppConfig(config: Record<string, string>, template: AppTemplate) {
  const missingFields = template.config_schema
    .filter(field => field.required && !config[field.key] && field.key !== 'primary_color')
    .map(field => field.name);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Ensure primary_color is a valid hex color
  if (config.primary_color && !/^#[0-9A-F]{6}$/i.test(config.primary_color)) {
    throw new Error('Invalid color format. Please use hex color (e.g., #FF0000)');
  }
}

export function validateAppName(name: string) {
  if (!name.trim()) {
    throw new Error('App name is required');
  }
  if (name.length < 3) {
    throw new Error('App name must be at least 3 characters long');
  }
  if (name.length > 50) {
    throw new Error('App name must be less than 50 characters');
  }
}

export function sanitizeSlug(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}