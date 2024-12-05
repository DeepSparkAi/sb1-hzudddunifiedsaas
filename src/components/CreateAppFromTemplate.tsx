import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { AppTemplate, ConfigField } from '../types/template';
import { validateAppConfig, validateAppName, sanitizeSlug } from '../utils/validation';
import { generateUniqueSlug, createApp, createProducts } from '../utils/api';
import { DEFAULT_APP_COLOR } from '../utils/constants';

interface Props {
  template: AppTemplate;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAppFromTemplate({ template, isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [config, setConfig] = useState<Record<string, string>>({
    primary_color: DEFAULT_APP_COLOR,
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderConfigField = (field: ConfigField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={config[field.key] || field.default_value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required={field.required}
          />
        );
      case 'color':
        return (
          <input
            type="color"
            value={config[field.key] || field.default_value || DEFAULT_APP_COLOR}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required={field.required}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be signed in to create an app');
      }

      // Validate inputs
      validateAppName(name);
      validateAppConfig(config, template);

      // Generate a unique slug
      const uniqueSlug = await generateUniqueSlug(sanitizeSlug(slug || name));

      // Create the app
      const app = await createApp({
        name,
        slug: uniqueSlug,
        template,
        config,
        userId: session.user.id
      });

      // Create the products
      await createProducts({
        appId: app.id,
        products: template.default_products,
        accessToken: session.access_token
      });

      toast.success('App created successfully!');
      onClose();
      
      // Refresh the page to show the new app
      window.location.reload();
    } catch (error) {
      console.error('Error creating app:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Generate initial slug from name if slug is empty
    if (!slug) {
      setSlug(sanitizeSlug(newName));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create App from {template.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              App Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              URL Slug
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be used in your app's URL. Only lowercase letters, numbers, and hyphens are allowed.
            </p>
          </div>

          {template.config_schema.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configuration
              </h3>
              {template.config_schema.map((field) => (
                <div key={field.key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.name}
                    {field.required && field.key !== 'primary_color' && <span className="text-red-500">*</span>}
                  </label>
                  <p className="text-sm text-gray-500 mb-2">{field.description}</p>
                  {renderConfigField(field)}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create App'}
          </button>
        </form>
      </div>
    </div>
  );
}