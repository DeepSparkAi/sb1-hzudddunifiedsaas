import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { PricingSection } from '../components/PricingSection';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';

export function PublicAppPage() {
  const { slug } = useParams();
  const { app, loading, error } = useApp();
  const { user } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!app) return <ErrorMessage message="App not found" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header 
        className="bg-white shadow-sm" 
        style={{ 
          backgroundColor: app.primary_color,
          color: '#ffffff'
        }}
      >
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {app.logo_url && (
                <img 
                  src={app.logo_url} 
                  alt={app.name} 
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{app.name}</h1>
                <p className="text-sm opacity-90">{app.description}</p>
              </div>
            </div>
            {user && (
              <Link
                to="/"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black/20 hover:bg-black/30 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Apps
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PricingSection appId={app.id} />
      </main>
    </div>
  );
}