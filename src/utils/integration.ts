import { IntegrationCodeParams } from '../types/integration';
import { supabase } from '../lib/supabase';

export async function verifyIntegration(appId: string, externalUrl: string): Promise<boolean> {
  try {
    // Validate URL
    const url = new URL(externalUrl);
    
    // Attempt to fetch the page
    const response = await fetch(url.toString(), {
      method: 'HEAD',
      mode: 'no-cors'
    });

    // Update the app's integration status
    const { error } = await supabase
      .from('apps')
      .update({
        metadata: {
          external_url: externalUrl,
          integration_status: 'verified',
          last_verified: new Date().toISOString()
        }
      })
      .eq('id', appId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Integration verification failed:', error);
    return false;
  }
}

export function generateIntegrationCode(params: IntegrationCodeParams): string {
  const {
    appId,
    appName,
    mode,
    features,
    returnUrl
  } = params;

  const apiUrl = mode === 'live' 
    ? 'https://api.unifiedsaas.com'
    : 'https://api-test.unifiedsaas.com';

  return `
// UnifiedSaaS Integration Script
// App: ${appName}
// Generated: ${new Date().toISOString()}

(function() {
  const config = {
    appId: "${appId}",
    mode: "${mode}",
    apiUrl: "${apiUrl}",
    features: ${JSON.stringify(features)},
    returnUrl: "${returnUrl}"
  };

  window.UnifiedSaaS = {
    init: async function() {
      try {
        const response = await fetch(\`\${config.apiUrl}/apps/\${config.appId}/verify\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            features: config.features,
            returnUrl: config.returnUrl
          })
        });

        if (!response.ok) {
          throw new Error('Failed to initialize UnifiedSaaS');
        }

        console.log('UnifiedSaaS integration initialized successfully');
      } catch (error) {
        console.error('UnifiedSaaS initialization failed:', error);
      }
    },
    
    subscribe: async function(planId) {
      try {
        const response = await fetch(\`\${config.apiUrl}/subscriptions/create\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appId: config.appId,
            planId,
            returnUrl: config.returnUrl
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create subscription');
        }

        const { redirectUrl } = await response.json();
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Subscription creation failed:', error);
      }
    },

    getSubscriptionStatus: async function() {
      try {
        const response = await fetch(\`\${config.apiUrl}/subscriptions/status\`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to get subscription status');
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to get subscription status:', error);
        return null;
      }
    }
  };

  // Initialize when the script loads
  window.UnifiedSaaS.init();
})();`.trim();
}

export function getIntegrationStatus(status: string): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        color: 'green'
      };
    case 'pending_verification':
      return {
        label: 'Pending Verification',
        color: 'yellow'
      };
    case 'failed':
      return {
        label: 'Verification Failed',
        color: 'red'
      };
    default:
      return {
        label: 'Not Connected',
        color: 'gray'
      };
  }
}